import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { projectService } from '@/services/projects';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Project } from '@/types';
import {
    TextField,
    Grid,
    Box,
    MenuItem,
    alpha,
} from '@mui/material';
import DatePicker from '@/components/ui/DatePicker';

interface ProjectFormData {
    name: string;
    description: string;
    status: Project['status'];
    start_date: string;
    end_date: string;
    budget: string;
}

interface ProjectFormProps {
    projectId?: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ProjectForm({ projectId, onSuccess, onCancel }: ProjectFormProps) {
    const { t } = useTranslation();
    const { id: routeId } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    
    // Determine if we are editing based on props OR route param
    const id = projectId || (routeId ? Number(routeId) : undefined);
    const isEdit = !!id;

    const [formData, setFormData] = useState<ProjectFormData>({
        name: '',
        description: '',
        status: 'planning',
        start_date: '',
        end_date: '',
        budget: '',
    });

    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // Load project data if editing
    const { data: project, isLoading, error: projectError } = useQuery({
        queryKey: ['project', id],
        queryFn: () => projectService.getProject(Number(id!)),
        enabled: isEdit && !!id,
    });

    useEffect(() => {
        if (project && isEdit) {
            // Helper function to format date for input[type="date"]
            const formatDateForInput = (dateValue: string | null | undefined): string => {
                if (!dateValue) return '';
                
                try {
                    // Handle ISO date strings (e.g., "2025-11-20T00:00:00.000000Z")
                    // Extract just the date part if it's a full ISO string
                    const dateStr = dateValue.toString().split('T')[0];
                    if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) {
                        return dateStr;
                    }
                    
                    // Otherwise, try parsing as Date
                    const date = new Date(dateValue);
                    if (isNaN(date.getTime())) return '';
                    
                    // Format as YYYY-MM-DD for input[type="date"]
                    const year = date.getFullYear();
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const day = String(date.getDate()).padStart(2, '0');
                    return `${year}-${month}-${day}`;
                } catch (e) {
                    console.error('Error formatting date:', e, dateValue);
                    return '';
                }
            };

            setFormData({
                name: project.name || '',
                description: project.description || '',
                status: project.status || 'planning',
                start_date: formatDateForInput(project.start_date),
                end_date: formatDateForInput(project.end_date),
                budget: project.budget?.toString() || '',
            });
        }
    }, [project, isEdit]);

    const createMutation = useMutation({
        mutationFn: projectService.createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/projects');
            }
        },
        onError: (error: any) => {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Project>) => projectService.updateProject(Number(id!), data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            queryClient.invalidateQueries({ queryKey: ['project', id] });
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/projects');
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

        const payload: Partial<Project> = {
            name: formData.name,
            description: formData.description || undefined,
            status: formData.status,
            start_date: formData.start_date || undefined,
            end_date: formData.end_date || undefined,
            budget: formData.budget ? parseFloat(formData.budget) : undefined,
        };

        if (isEdit) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/projects');
        }
    };

    if (isEdit && isLoading) {
        return <div className="p-8 text-center">{t('projects.loading')}</div>;
    }

    if (isEdit && projectError) {
        return (
            <div className="p-8">
                <div className="bg-red-50 text-red-600 rounded p-4">
                    {t('projects.errorLoading')}: {projectError instanceof Error ? projectError.message : t('common.error')}
                </div>
            </div>
        );
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const isInModal = projectId || onSuccess;

    const formContent = (
        <form onSubmit={handleSubmit} className={isInModal ? "" : "bg-white p-6 rounded-lg shadow"}>
                {/* Name */}
                <div className="mb-4">
                    <label htmlFor="project-name" className="block text-sm font-medium mb-2">{t('projects.nameLabel')} *</label>
                    <input
                        id="project-name"
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                    )}
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label htmlFor="project-description" className="block text-sm font-medium mb-2">{t('projects.description')}</label>
                    <textarea
                        id="project-description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder={t('projects.descriptionPlaceholder')}
                    />
                </div>

                {/* Status */}
                <Box sx={{ mb: 3 }}>
                    <TextField
                        fullWidth
                        select
                        label={t('projects.status')}
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                        sx={{
                            '& .MuiOutlinedInput-root': {
                                backgroundColor: (theme) =>
                                    theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.background.paper, 0.8)
                                        : theme.palette.background.paper,
                                '&:hover': {
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.background.paper, 0.9)
                                            : alpha(theme.palette.primary.main, 0.02),
                                },
                                '&.Mui-focused': {
                                    backgroundColor: (theme) =>
                                        theme.palette.mode === 'dark'
                                            ? theme.palette.background.paper
                                            : theme.palette.background.paper,
                                },
                            },
                        }}
                    >
                        <MenuItem value="planning">{t('projects.statusPlanning')}</MenuItem>
                        <MenuItem value="active">{t('projects.statusActive')}</MenuItem>
                        <MenuItem value="on_hold">{t('projects.statusOnHold')}</MenuItem>
                        <MenuItem value="completed">{t('projects.statusCompleted')}</MenuItem>
                        <MenuItem value="cancelled">{t('projects.statusCancelled')}</MenuItem>
                    </TextField>
                </Box>

                {/* Dates */}
                <Grid container spacing={2} sx={{ mb: 3, mt: 3 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <DatePicker
                            label={t('projects.startDate')}
                            value={formData.start_date || null}
                            onChange={(value) => setFormData({ ...formData, start_date: value || '' })}
                            fullWidth
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <DatePicker
                            label={t('projects.endDate')}
                            value={formData.end_date || null}
                            onChange={(value) => setFormData({ ...formData, end_date: value || '' })}
                            fullWidth
                        />
                    </Grid>
                </Grid>

                {/* Budget */}
                <div className="mb-6">
                    <label htmlFor="project-budget" className="block text-sm font-medium mb-2">{t('projects.budget')}</label>
                    <input
                        id="project-budget"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
                        placeholder={t('projects.budgetPlaceholder')}
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shadow-sm"
                    >
                        {isSubmitting ? t('projects.saving') : isEdit ? t('projects.updateProject') : t('projects.createProjectButton')}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </form>
    );

    if (isInModal) {
        return formContent;
    }

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
                {isEdit ? t('projects.editProject') : t('projects.createProject')}
            </h2>
            {formContent}
        </div>
    );
}
