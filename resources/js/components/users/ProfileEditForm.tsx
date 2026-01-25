import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { userService } from '@/services/users';
import api from '@/services/api';
import { useState, useRef } from 'react';
import { useAuthStore } from '@/store/auth';
import { toast } from 'react-toastify';
import type { User } from '@/types';

interface ProfileEditFormProps {
    user: User;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ProfileEditForm({ user, onSuccess, onCancel }: ProfileEditFormProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const authStore = useAuthStore();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: user.name || '',
        email: user.email || '',
        password: '',
        confirmPassword: '',
    });

    const [avatar, setAvatar] = useState<string | null>(user.avatar || null);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [errors, setErrors] = useState<Record<string, string[]>>({});
    const [isUploading, setIsUploading] = useState(false);

    const updateMutation = useMutation({
        mutationFn: async (data: { name: string; email: string; password?: string; avatar?: File }) => {
            // First upload avatar if there's a new file
            if (avatarFile) {
                setIsUploading(true);
                try {
                    const formData = new FormData();
                    formData.append('avatar', avatarFile);
                    const response = await api.post('/users/avatar', formData);
                    // Update avatar preview with new URL
                    if (response.data?.data?.avatar) {
                        setAvatar(response.data.data.avatar);
                        // Update auth store with new avatar
                        const updatedUser = { ...user, avatar: response.data.data.avatar };
                        authStore.setUser(updatedUser);
                    }
                } catch (error: any) {
                    console.error('Avatar upload failed:', error);
                    // Don't throw if it's a 401 - let the interceptor handle it
                    // But check if it's a validation error (422) or other error
                    if (error.response?.status === 401) {
                        // 401 will be handled by interceptor
                        throw error;
                    }
                    // For other errors, show user-friendly message
                    const errorMessage = error.response?.data?.message || 'Failed to upload avatar';
                    toast.error(errorMessage);
                    throw error;
                } finally {
                    setIsUploading(false);
                }
            }

            const updateData: any = {
                name: data.name,
                email: data.email,
            };

            if (data.password) {
                updateData.password = data.password;
            }

            return userService.updateUser(user.id, updateData);
        },
        onSuccess: (updatedUser) => {
            // Update auth store with new user data
            authStore.setUser(updatedUser);
            // Update avatar if it was changed
            if (updatedUser.avatar) {
                setAvatar(updatedUser.avatar);
            }
            queryClient.invalidateQueries({ queryKey: ['user', user.id] });
            queryClient.invalidateQueries({ queryKey: ['auth'] });
            if (onSuccess) {
                onSuccess();
            }
        },
        onError: (error: any) => {
            // Handle 401 errors specifically
            if (error.response?.status === 401) {
                const errorMessage = error.response?.data?.message || 'Session expired. Please log in again.';
                toast.error(errorMessage);
                setErrors({ general: [errorMessage] });
                // Don't logout here - let user try again or manually logout
                // The interceptor will handle logout if token is truly invalid
            } else if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            } else {
                const errorMessage = error.response?.data?.message || 'An error occurred';
                toast.error(errorMessage);
                setErrors({ general: [errorMessage] });
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validation
        if (formData.password && formData.password !== formData.confirmPassword) {
            setErrors({ confirmPassword: ['Passwords do not match'] });
            return;
        }

        if (formData.password && formData.password.length < 8) {
            setErrors({ password: ['Password must be at least 8 characters'] });
            return;
        }

        updateMutation.mutate({
            name: formData.name,
            email: formData.email,
            password: formData.password || undefined,
            avatar: avatarFile || undefined,
        });
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors({ avatar: ['Please select an image file'] });
                return;
            }

            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ avatar: ['Image size must be less than 5MB'] });
                return;
            }

            setAvatarFile(file);
            setErrors({});

            // Create preview
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatar(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const removeAvatarMutation = useMutation({
        mutationFn: async () => {
            await api.delete('/users/avatar');
        },
        onSuccess: () => {
            setAvatar(null);
            setAvatarFile(null);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            // Refresh user data
            queryClient.invalidateQueries({ queryKey: ['user', user.id] });
            queryClient.invalidateQueries({ queryKey: ['auth'] });
            const updatedUser = { ...user, avatar: undefined };
            authStore.setUser(updatedUser);
        },
        onError: (error: any) => {
            console.error('Failed to remove avatar:', error);
            toast.error(t('profile.removeAvatarError') || 'Failed to remove avatar');
        },
    });

    const handleRemoveAvatar = () => {
        removeAvatarMutation.mutate();
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Avatar Upload */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('auth.avatar')}
                </label>
                <div className="flex items-center gap-4">
                    <div className="relative">
                        {avatar ? (
                            <img
                                src={avatar}
                                alt={user.name}
                                className="w-20 h-20 rounded-full object-cover border-2 border-gray-300"
                            />
                        ) : (
                            <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center border-2 border-gray-300">
                                <span className="text-2xl text-gray-500 font-medium">
                                    {user.name?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-2">
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            className="hidden"
                            id="avatar-upload"
                        />
                        <label
                            htmlFor="avatar-upload"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer text-sm font-medium transition-colors"
                        >
                            {avatar ? t('common.update') : t('common.upload')}
                        </label>
                        {avatar && (
                            <button
                                type="button"
                                onClick={handleRemoveAvatar}
                                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm font-medium transition-colors"
                            >
                                {t('common.remove')}
                            </button>
                        )}
                    </div>
                </div>
                {errors.avatar && (
                    <p className="mt-1 text-sm text-red-600">{errors.avatar[0]}</p>
                )}
            </div>

            {/* Name */}
            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.name')} *
                </label>
                <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                )}
            </div>

            {/* Email */}
            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.email')} *
                </label>
                <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                />
                {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email[0]}</p>
                )}
            </div>

            {/* Password */}
            <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    {t('auth.password')} ({t('common.optional')})
                </label>
                <input
                    type="password"
                    id="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={t('auth.password')}
                />
                {errors.password && (
                    <p className="mt-1 text-sm text-red-600">{errors.password[0]}</p>
                )}
            </div>

            {/* Confirm Password */}
            {formData.password && (
                <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                        {t('auth.confirmPassword')} *
                    </label>
                    <input
                        type="password"
                        id="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        required
                    />
                    {errors.confirmPassword && (
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword[0]}</p>
                    )}
                </div>
            )}

            {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600">{errors.general[0]}</p>
                </div>
            )}

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                    >
                        {t('common.cancel')}
                    </button>
                )}
                <button
                    type="submit"
                    disabled={updateMutation.isPending || isUploading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {updateMutation.isPending || isUploading
                        ? t('common.saving')
                        : t('common.update')}
                </button>
            </div>
        </form>
    );
}
