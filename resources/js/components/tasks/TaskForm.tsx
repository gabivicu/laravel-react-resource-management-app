import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { taskService } from '@/services/tasks';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Task } from '@/types';
import ProjectSelector from '@/components/projects/ProjectSelector';
import {
    Box,
    TextField,
    MenuItem,
    Button,
    Typography,
    CircularProgress,
    Grid,
    alpha,
    useTheme,
    GlobalStyles,
} from '@mui/material';
import DatePicker from '@/components/ui/DatePicker';

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
    const theme = useTheme();
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
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending;

    return (
        <>
            <GlobalStyles
                styles={{
                    '.MuiPopover-root[role="presentation"]': {
                        zIndex: '1400 !important',
                    },
                    '.MuiMenu-root .MuiPopover-root': {
                        zIndex: '1400 !important',
                    },
                    '.MuiMenu-root .MuiBackdrop-root': {
                        pointerEvents: 'none !important',
                        backgroundColor: 'transparent !important',
                    },
                }}
            />
            <Box sx={{ maxWidth: onSuccess ? 'none' : 800, mx: 'auto', p: 3 }}>
            {!onSuccess && (
                <Typography variant="h5" fontWeight={600} gutterBottom sx={{ mb: 3 }}>
                    {isEdit ? t('tasks.editTask') : t('tasks.createTask')}
                </Typography>
            )}

            <Box component="form" onSubmit={handleSubmit}>
                {/* Project Selector */}
                <ProjectSelector
                    label={t('tasks.project')}
                    value={formData.project_id}
                    onChange={(id) => setFormData({ ...formData, project_id: id })}
                    error={errors.project_id?.[0]}
                    initialProject={task?.project}
                    disabled={isEdit}
                />

                {/* Title */}
                <TextField
                    id="title"
                    fullWidth
                    label={t('tasks.titleLabel')}
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    error={!!errors.title}
                    helperText={errors.title?.[0]}
                    sx={{ mb: 3 }}
                />

                {/* Description */}
                <TextField
                    id="description"
                    fullWidth
                    label={t('tasks.description')}
                    multiline
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    sx={{ mb: 3 }}
                />

                {/* Status and Priority */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            select
                            label={t('tasks.status')}
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value as Task['status'] })}
                            SelectProps={{
                                MenuProps: {
                                    disablePortal: true,
                                    disableScrollLock: true,
                                    disableEnforceFocus: true,
                                    disableAutoFocus: true,
                                    disableRestoreFocus: true,
                                    hideBackdrop: true,
                                    PaperProps: {
                                        sx: {
                                            borderRadius: '4px !important',
                                            backgroundColor: `${theme.palette.background.paper} !important`,
                                            border: `1px solid ${theme.palette.divider} !important`,
                                            boxShadow: `${theme.shadows[8]} !important`,
                                            marginTop: '8px !important',
                                        },
                                    },
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                    transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'left',
                                    },
                                    sx: {
                                        zIndex: '1400 !important',
                                    },
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: theme.shape.borderRadius || 8,
                                    backgroundColor: theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.background.paper, 0.8)
                                        : theme.palette.background.paper,
                                    '&:hover': {
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.background.paper, 0.9)
                                            : alpha(theme.palette.primary.main, 0.02),
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? theme.palette.background.paper
                                            : theme.palette.background.paper,
                                    },
                                },
                            }}
                        >
                            <MenuItem value="todo">{t('tasks.statusTodo')}</MenuItem>
                            <MenuItem value="in_progress">{t('tasks.statusInProgress')}</MenuItem>
                            <MenuItem value="review">{t('tasks.statusReview')}</MenuItem>
                            <MenuItem value="done">{t('tasks.statusDone')}</MenuItem>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            select
                            label={t('tasks.priority')}
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as Task['priority'] })}
                            SelectProps={{
                                MenuProps: {
                                    disablePortal: true,
                                    disableScrollLock: true,
                                    disableEnforceFocus: true,
                                    disableAutoFocus: true,
                                    disableRestoreFocus: true,
                                    hideBackdrop: true,
                                    PaperProps: {
                                        sx: {
                                            borderRadius: '4px !important',
                                            backgroundColor: `${theme.palette.background.paper} !important`,
                                            border: `1px solid ${theme.palette.divider} !important`,
                                            boxShadow: `${theme.shadows[8]} !important`,
                                            marginTop: '8px !important',
                                        },
                                    },
                                    anchorOrigin: {
                                        vertical: 'bottom',
                                        horizontal: 'left',
                                    },
                                    transformOrigin: {
                                        vertical: 'top',
                                        horizontal: 'left',
                                    },
                                    sx: {
                                        zIndex: '1400 !important',
                                    },
                                },
                            }}
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: theme.shape.borderRadius || 8,
                                    backgroundColor: theme.palette.mode === 'dark'
                                        ? alpha(theme.palette.background.paper, 0.8)
                                        : theme.palette.background.paper,
                                    '&:hover': {
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? alpha(theme.palette.background.paper, 0.9)
                                            : alpha(theme.palette.primary.main, 0.02),
                                    },
                                    '&.Mui-focused': {
                                        backgroundColor: theme.palette.mode === 'dark'
                                            ? theme.palette.background.paper
                                            : theme.palette.background.paper,
                                    },
                                },
                            }}
                        >
                            <MenuItem value="low">{t('tasks.priorityLow')}</MenuItem>
                            <MenuItem value="medium">{t('tasks.priorityMedium')}</MenuItem>
                            <MenuItem value="high">{t('tasks.priorityHigh')}</MenuItem>
                            <MenuItem value="urgent">{t('tasks.priorityUrgent')}</MenuItem>
                        </TextField>
                    </Grid>
                </Grid>

                {/* Due Date */}
                <DatePicker
                    label={t('tasks.dueDate')}
                    value={formData.due_date || null}
                    onChange={(value) => setFormData({ ...formData, due_date: value || '' })}
                    fullWidth
                    sx={{ mb: 3 }}
                />

                {/* Hours */}
                <Grid container spacing={2} sx={{ mb: 3 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label={t('tasks.estimatedHours')}
                            value={formData.estimated_hours}
                            onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                            inputProps={{ step: 0.1, min: 0 }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                        <TextField
                            fullWidth
                            type="number"
                            label={t('tasks.actualHours')}
                            value={formData.actual_hours}
                            onChange={(e) => setFormData({ ...formData, actual_hours: e.target.value })}
                            inputProps={{ step: 0.1, min: 0 }}
                        />
                    </Grid>
                </Grid>

                {/* Actions */}
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        type="submit"
                        variant="contained"
                        disabled={isSubmitting}
                        fullWidth={!onSuccess}
                        sx={{ flex: onSuccess ? 1 : 'none' }}
                    >
                        {isSubmitting ? (
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                        ) : null}
                        {isSubmitting ? t('tasks.saving') : isEdit ? t('tasks.updateTask') : t('tasks.createTaskButton')}
                    </Button>
                    <Button
                        type="button"
                        variant="outlined"
                        onClick={handleCancel}
                    >
                        {t('common.cancel')}
                    </Button>
                </Box>
            </Box>
        </Box>
        </>
    );
}
