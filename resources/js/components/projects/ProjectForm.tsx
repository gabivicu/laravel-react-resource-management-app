import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projects';
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Project } from '@/types';

interface ProjectFormData {
    name: string;
    description: string;
    status: Project['status'];
    start_date: string;
    end_date: string;
    budget: string;
}

export default function ProjectForm() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
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
    const { data: project, isLoading } = useQuery({
        queryKey: ['project', id],
        queryFn: () => projectService.getProject(Number(id!)),
        enabled: isEdit,
    });

    useEffect(() => {
        if (project && isEdit) {
            setFormData({
                name: project.name,
                description: project.description || '',
                status: project.status,
                start_date: project.start_date ? new Date(project.start_date).toISOString().split('T')[0] : '',
                end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
                budget: project.budget?.toString() || '',
            });
        }
    }, [project, isEdit]);

    const createMutation = useMutation({
        mutationFn: projectService.createProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            navigate('/projects');
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
            navigate('/projects');
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

    if (isEdit && isLoading) {
        return <div className="p-8">Loading...</div>;
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">
                {isEdit ? 'Edit Project' : 'Create New Project'}
            </h2>

            <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
                {/* Name */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Project Name *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg ${
                            errors.name ? 'border-red-500' : ''
                        }`}
                        required
                    />
                    {errors.name && (
                        <p className="mt-1 text-sm text-red-600">{errors.name[0]}</p>
                    )}
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Description</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border rounded-lg"
                    />
                </div>

                {/* Status */}
                <div className="mb-4">
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as Project['status'] })}
                        className="w-full px-3 py-2 border rounded-lg"
                    >
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {/* Dates */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">Start Date</label>
                        <input
                            type="date"
                            value={formData.start_date}
                            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg"
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

                {/* Budget */}
                <div className="mb-6">
                    <label className="block text-sm font-medium mb-2">Budget</label>
                    <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.budget}
                        onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                        className="w-full px-3 py-2 border rounded-lg"
                        placeholder="0.00"
                    />
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? 'Saving...' : isEdit ? 'Update Project' : 'Create Project'}
                    </button>
                    <button
                        type="button"
                        onClick={() => navigate('/projects')}
                        className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
}
