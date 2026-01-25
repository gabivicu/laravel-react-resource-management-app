import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { taskService } from '@/services/tasks';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '@/types';
import ProjectSelector from '@/components/projects/ProjectSelector';

interface TaskFormData {
    project_id: string;
    title: string;
    description: string;
    status: Task['status'];
    priority: Task['priority'];
    due_date: string;
    estimated_hours: string;
    actual_hours: string;
    assignee_ids: number[];
}

interface TaskFormProps {
    taskId?: number;
    initialProjectId?: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function TaskForm({ taskId, initialProjectId, onSuccess, onCancel }: TaskFormProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = !!taskId;

    const [formData, setFormData] = useState<TaskFormData>({
        project_id: initialProjectId ? initialProjectId.toString() : '',
        title: '',
        description: '',
        status: 'todo',
        priority: 'medium',
        due_date: '',
        estimated_hours: '',
        actual_hours: '',
        assignee_ids: [],
    });

    const [errors, setErrors] = useState<Record<string, string[]>>({});

    // Load task data if editing
    const { data: task, isLoading } = useQuery({
        queryKey: ['task', taskId],
        queryFn: () => taskService.getTask(taskId!),
        enabled: isEdit,
    });

    useEffect(() => {
        if (task && isEdit) {
            setFormData({
                project_id: task.project_id.toString(),
                title: task.title,
                description: task.description || '',
                status: task.status,
                priority: task.priority,
                due_date: task.due_date ? new Date(task.due_date).toISOString().split('T')[0] : '',
                estimated_hours: task.estimated_hours?.toString() || '',
                actual_hours: task.actual_hours?.toString() || '',
                assignee_ids: task.assignees?.map((a) => a.id) || [],
            });
        }
    }, [task, isEdit]);

    const createMutation = useMutation({
        mutationFn: taskService.createTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/tasks');
            }
        },
        onError: (error: any) => {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<Task> & { assignee_ids?: number[] }) =>
            taskService.updateTask(taskId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            queryClient.invalidateQueries({ queryKey: ['task', taskId] });
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/tasks');
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

        const payload: Partial<Task> & { assignee_ids?: number[] } = {
            project_id: parseInt(formData.project_id),
            title: formData.title,
            description: formData.description || undefined,
            status: formData.status,
            priority: formData.priority,
            due_date: formData.due_date || undefined,
            estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
            actual_hours: formData.actual_hours ? parseFloat(formData.actual_hours) : undefined,
            assignee_ids: formData.assignee_ids,
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
            navigate('/tasks');
        }
    };

    if (isEdit && isLoading) {
        return <div className="p-8 text-center text-gray-500">{t('tasks.loadingTaskData')}</div>;
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <div className={onSuccess ? "" : "max-w-2xl mx-auto"}>
            {!onSuccess && (
                <h2 className="text-2xl font-bold mb-6">
                    {isEdit ? t('tasks.editTask') : t('tasks.createTask')}
                </h2>
            )}

            <form onSubmit={handleSubmit} className={onSuccess ? "" : "bg-white p-6 rounded-lg shadow"}>
                {/* Project Selector */}
                <ProjectSelector
                    value={formData.project_id}
                    onChange={(id) => setFormData({ ...formData, project_id: id })}
                    error={errors.project_id?.[0]}
                    initialProject={task?.project}
                    disabled={isEdit} // Optional: Disable project change on edit if desired, usually safer
                />

                {/* Title */}
                <div className="mb-4">
                    <label htmlFor="title" className="block text-sm font-medium mb-2">{t('tasks.titleLabel')} *</label>
                    <input
                        id="title"
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className={`w-full px-3 py-2 border rounded-lg ${
                            errors.title ? 'border-red-500' : 'border-gray-300'
                        }`}
                        required
                    />
                    {errors.title && (
                        <p className="mt-1 text-sm text-red-600">{errors.title[0]}</p>
                    )}
                </div>

                {/* Description */}
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium mb-2">{t('tasks.description')}</label>
                    <textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows={4}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                </div>

                {/* Status and Priority */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <label htmlFor="status" className="block text-sm font-medium mb-2">{t('tasks.status')}</label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="todo">{t('tasks.statusTodo')}</option>
                            <option value="in_progress">{t('tasks.statusInProgress')}</option>
                            <option value="review">{t('tasks.statusReview')}</option>
                            <option value="done">{t('tasks.statusDone')}</option>
                        </select>
                    </div>
                    <div>
                        <label htmlFor="priority" className="block text-sm font-medium mb-2">{t('tasks.priority')}</label>
                        <select
                            id="priority"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        >
                            <option value="low">{t('tasks.priorityLow')}</option>
                            <option value="medium">{t('tasks.priorityMedium')}</option>
                            <option value="high">{t('tasks.priorityHigh')}</option>
                            <option value="urgent">{t('tasks.priorityUrgent')}</option>
                        </select>
                    </div>
                </div>

                {/* Due Date */}
                <div className="mb-4">
                    <label htmlFor="due_date" className="block text-sm font-medium mb-2">{t('tasks.dueDate')}</label>
                    <input
                        id="due_date"
                        type="date"
                        value={formData.due_date}
                        onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    />
                </div>

                {/* Hours */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div>
                        <label htmlFor="estimated_hours" className="block text-sm font-medium mb-2">{t('tasks.estimatedHours')}</label>
                        <input
                            id="estimated_hours"
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.estimated_hours}
                            onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                    <div>
                        <label htmlFor="actual_hours" className="block text-sm font-medium mb-2">{t('tasks.actualHours')}</label>
                        <input
                            id="actual_hours"
                            type="number"
                            step="0.1"
                            min="0"
                            value={formData.actual_hours}
                            onChange={(e) => setFormData({ ...formData, actual_hours: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {isSubmitting ? t('tasks.saving') : isEdit ? t('tasks.updateTask') : t('tasks.createTaskButton')}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                        {t('common.cancel')}
                    </button>
                </div>
            </form>
        </div>
    );
}
