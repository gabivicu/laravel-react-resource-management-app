import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { resourceAllocationService } from '@/services/resourceAllocations';
import { userService } from '@/services/users';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ResourceAllocation } from '@/types';
import ProjectSelector from '@/components/projects/ProjectSelector';

interface ResourceAllocationFormData {
    project_id: string;
    user_id: string;
    role: string;
    allocation_percentage: string;
    start_date: string;
    end_date: string;
    notes: string;
}

interface ResourceAllocationFormProps {
    allocationId?: number;
    initialProjectId?: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ResourceAllocationForm({ 
    allocationId, 
    initialProjectId, 
    onSuccess, 
    onCancel 
}: ResourceAllocationFormProps = {}) {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = !!allocationId || !!id;
    const editId = allocationId || (id ? Number(id) : undefined);

    const [formData, setFormData] = useState<ResourceAllocationFormData>({
        project_id: initialProjectId ? initialProjectId.toString() : '',
        user_id: '',
        role: '',
        allocation_percentage: '',
        start_date: '',
        end_date: '',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const { data: usersData } = useQuery({
        queryKey: ['users', 'select'],
        queryFn: () => userService.getUsers({}, 100),
    });

    const { data: allocation, isLoading } = useQuery({
        queryKey: ['resource-allocation', editId],
        queryFn: () => resourceAllocationService.getAllocation(editId!),
        enabled: isEdit && !!editId,
    });

    useEffect(() => {
        if (allocation && isEdit) {
            setFormData({
                project_id: allocation.project_id.toString(),
                user_id: allocation.user_id.toString(),
                role: allocation.role || '',
                allocation_percentage: allocation.allocation_percentage.toString(),
                start_date: new Date(allocation.start_date).toISOString().split('T')[0],
                end_date: allocation.end_date ? new Date(allocation.end_date).toISOString().split('T')[0] : '',
                notes: allocation.notes || '',
            });
        }
    }, [allocation, isEdit]);

    const createMutation = useMutation({
        mutationFn: resourceAllocationService.createAllocation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-allocations'] });
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/resource-allocations');
            }
        },
        onError: (error: any) => {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<ResourceAllocation>) =>
            resourceAllocationService.updateAllocation(editId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-allocations'] });
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/resource-allocations');
            }
        },
        onError: (error: any) => {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const payload: Partial<ResourceAllocation> = {
            project_id: parseInt(formData.project_id),
            user_id: parseInt(formData.user_id),
            role: formData.role || undefined,
            allocation_percentage: parseFloat(formData.allocation_percentage),
            start_date: formData.start_date,
            end_date: formData.end_date || undefined,
            notes: formData.notes || undefined,
        };

        if (isEdit) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    if (isEdit && isLoading) {
        return <div className="p-8">Loading...</div>;
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const users = usersData?.data || [];

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/resource-allocations');
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Project */}
            <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Project *</label>
                <ProjectSelector
                    value={formData.project_id ? Number(formData.project_id) : undefined}
                    onChange={(id) => setFormData({ ...formData, project_id: id ? id.toString() : '' })}
                    disabled={isEdit}
                    label=""
                />
                {errors.project_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.project_id[0]}</p>
                )}
            </div>

                {/* User */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">User *</label>
                    <select
                        value={formData.user_id}
                        onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg ${
                            errors.user_id ? 'border-red-500' : ''
                        }`}
                        required
                        disabled={isEdit}
                    >
                        <option value="">Select a user</option>
                        {users.map((user) => (
                            <option key={user.id} value={user.id}>
                                {user.name} ({user.email})
                            </option>
                        ))}
                    </select>
                    {errors.user_id && (
                        <p className="mt-1 text-sm text-red-600">{errors.user_id[0]}</p>
                    )}
                </div>

                {/* Allocation Percentage */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Allocation Percentage *</label>
                    <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="100"
                        value={formData.allocation_percentage}
                        onChange={(e) => setFormData({ ...formData, allocation_percentage: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg ${
                            errors.allocation_percentage ? 'border-red-500' : ''
                        }`}
                        required
                    />
                    {errors.allocation_percentage && (
                        <p className="mt-1 text-sm text-red-600">{errors.allocation_percentage[0]}</p>
                    )}
                </div>

                {/* Role */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Role</label>
                    <input
                        type="text"
                        value={formData.role}
                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="e.g., Developer, Designer"
                    />
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Start Date *</label>
                        <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium mb-2">End Date</label>
                        <input
                            type="date"
                            value={formData.end_date}
                            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
                        />
                    </div>
                </div>

                {/* Notes */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Notes</label>
                    <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : isEdit ? 'Update Allocation' : 'Create Allocation'}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
    );
}
