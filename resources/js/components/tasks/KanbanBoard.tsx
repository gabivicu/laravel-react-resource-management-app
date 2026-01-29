import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { taskService } from '@/services/tasks';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Task } from '@/types';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    Avatar,
    AvatarGroup,
    Chip,
    Skeleton,
    Tooltip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Add as AddIcon,
    CalendarToday as CalendarIcon,
    DragIndicator as DragIcon,
} from '@mui/icons-material';
import ProjectSelector from '@/components/projects/ProjectSelector';
import Modal from '@/components/ui/Modal';
import TaskForm from './TaskForm';
import { PageHeader, EmptyState } from '@/components/ui';

interface KanbanColumn {
    id: string;
    label: string;
    color: string;
    bgColor: string;
}

const columns: KanbanColumn[] = [
    { id: 'todo', label: 'To Do', color: '#64748B', bgColor: 'rgba(100, 116, 139, 0.08)' },
    { id: 'in_progress', label: 'In Progress', color: '#3B82F6', bgColor: 'rgba(59, 130, 246, 0.08)' },
    { id: 'review', label: 'Review', color: '#F59E0B', bgColor: 'rgba(245, 158, 11, 0.08)' },
    { id: 'done', label: 'Done', color: '#10B981', bgColor: 'rgba(16, 185, 129, 0.08)' },
];

const priorityConfig = {
    low: { label: 'Low', color: '#64748B' },
    medium: { label: 'Medium', color: '#3B82F6' },
    high: { label: 'High', color: '#F59E0B' },
    urgent: { label: 'Urgent', color: '#EF4444' },
};

interface KanbanBoardProps {
    initialProjectId?: number;
}

export default function KanbanBoard({ initialProjectId }: KanbanBoardProps) {
    const { t } = useTranslation();
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();

    const [selectedProjectId, setSelectedProjectId] = useState<string>(
        searchParams.get('project_id') || (initialProjectId ? initialProjectId.toString() : '')
    );
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
    const [dropTarget, setDropTarget] = useState<string | null>(null);

    // WebSocket integration
    useEffect(() => {
        if (!selectedProjectId) return;

        const channel = window.Echo.private(`projects.${selectedProjectId}`);

        channel.listen('.TaskMoved', (e: any) => {
            queryClient.setQueryData(['tasks', 'kanban', selectedProjectId], (old: any) => {
                if (!old) return old;

                // Create deep copies of all arrays to avoid mutations
                const updated = {
                    todo: [...(old.todo || [])],
                    in_progress: [...(old.in_progress || [])],
                    review: [...(old.review || [])],
                    done: [...(old.done || [])],
                };

                const taskData = e;
                let foundTask: Task | undefined;

                // Find and remove task from any column
                Object.keys(updated).forEach((status) => {
                    const statusKey = status as keyof typeof updated;
                    const index = updated[statusKey].findIndex((t: Task) => t.id === taskData.id);
                    if (index !== -1) {
                        foundTask = updated[statusKey][index];
                        updated[statusKey] = updated[statusKey].filter((t: Task) => t.id !== taskData.id);
                    }
                });

                if (foundTask) {
                    const updatedTask = { ...foundTask, ...taskData };
                    const targetStatus = taskData.status as keyof typeof updated;
                    updated[targetStatus] = [...updated[targetStatus], updatedTask].sort(
                        (a: Task, b: Task) => (a.order || 0) - (b.order || 0)
                    );
                    return updated;
                } else {
                    queryClient.invalidateQueries({ queryKey: ['tasks', 'kanban', selectedProjectId] });
                    return old;
                }
            });
        });

        return () => {
            window.Echo.leave(`projects.${selectedProjectId}`);
        };
    }, [selectedProjectId, queryClient]);

    const { data: kanbanData, isLoading, isError, error } = useQuery({
        queryKey: ['tasks', 'kanban', selectedProjectId],
        queryFn: () => taskService.getKanbanTasks(selectedProjectId ? Number(selectedProjectId) : undefined),
        enabled: !!selectedProjectId,
    });

    const updateOrderMutation = useMutation({
        mutationFn: ({ id, order, status }: { id: number; order: number; status?: Task['status'] }) =>
            taskService.updateTaskOrder(id, order, status),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
        },
    });

    const handleDragStart = (e: React.DragEvent, task: Task, status: string) => {
        setDraggedTask(task);
        setDraggedFrom(status);
        e.dataTransfer.effectAllowed = 'move';
        // Add a custom drag image
        const dragEl = e.currentTarget as HTMLElement;
        dragEl.style.opacity = '0.5';
    };

    const handleDragEnd = (e: React.DragEvent) => {
        const dragEl = e.currentTarget as HTMLElement;
        dragEl.style.opacity = '1';
        setDraggedTask(null);
        setDraggedFrom(null);
        setDropTarget(null);
    };

    const handleDragOver = (e: React.DragEvent, status: string) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        setDropTarget(status);
    };

    const handleDragLeave = () => {
        setDropTarget(null);
    };

    const handleDrop = async (e: React.DragEvent, targetStatus: string) => {
        e.preventDefault();
        setDropTarget(null);

        if (!draggedTask || !draggedFrom) return;

        const targetTasks = kanbanData?.[targetStatus as keyof typeof kanbanData] || [];
        const newOrder = targetTasks.length + 1;

        // Optimistic update - create deep copies to avoid mutating the original data
        queryClient.setQueryData(['tasks', 'kanban', selectedProjectId], (old: any) => {
            if (!old) return old;

            // Create a deep copy of the entire object
            const updated = {
                todo: [...(old.todo || [])],
                in_progress: [...(old.in_progress || [])],
                review: [...(old.review || [])],
                done: [...(old.done || [])],
            };

            // Remove task from source column
            const sourceColumn = draggedFrom as keyof typeof updated;
            updated[sourceColumn] = updated[sourceColumn].filter((t: Task) => t.id !== draggedTask.id);

            // Add task to target column only if it's different from source
            if (targetStatus !== draggedFrom) {
                const targetColumn = targetStatus as keyof typeof updated;
                updated[targetColumn] = [
                    ...updated[targetColumn],
                    { ...draggedTask, status: targetStatus as Task['status'], order: newOrder },
                ];
            }

            return updated;
        });

        // Update on server
        updateOrderMutation.mutate({
            id: draggedTask.id,
            order: newOrder,
            status: targetStatus !== draggedFrom ? (targetStatus as Task['status']) : undefined,
        });

        setDraggedTask(null);
        setDraggedFrom(null);
    };

    if (!selectedProjectId) {
        return (
            <Box>
                <PageHeader
                    title={t('kanban.title')}
                    subtitle="Select a project to view the Kanban board"
                >
                    <Box sx={{ minWidth: 250 }}>
                        <ProjectSelector
                            value={selectedProjectId ? Number(selectedProjectId) : undefined}
                            onChange={(id) => setSelectedProjectId(id.toString())}
                            label=""
                        />
                    </Box>
                </PageHeader>

                <EmptyState
                    type="tasks"
                    title={t('kanban.selectProject')}
                    description={t('kanban.selectProjectMessage')}
                />
            </Box>
        );
    }

    if (isLoading) {
        return (
            <Box>
                <PageHeader title={t('kanban.title')} subtitle="Loading tasks...">
                    <Box sx={{ minWidth: 250 }}>
                        <ProjectSelector
                            value={Number(selectedProjectId)}
                            onChange={(id) => setSelectedProjectId(id.toString())}
                            label=""
                        />
                    </Box>
                </PageHeader>

                <Box
                    sx={{
                        display: 'flex',
                        gap: 3,
                        overflowX: 'auto',
                        pb: 2,
                    }}
                >
                    {columns.map((col) => (
                        <Box key={col.id} sx={{ minWidth: 320, flex: '0 0 320px' }}>
                            <Skeleton variant="rounded" height={48} sx={{ mb: 2 }} />
                            {[1, 2, 3].map((i) => (
                                <Skeleton
                                    key={i}
                                    variant="rounded"
                                    height={140}
                                    sx={{ mb: 2 }}
                                />
                            ))}
                        </Box>
                    ))}
                </Box>
            </Box>
        );
    }

    if (isError) {
        return (
            <EmptyState
                type="error"
                title={t('kanban.errorLoading')}
                description={(error as Error).message}
            />
        );
    }

    const tasks = kanbanData || { todo: [], in_progress: [], review: [], done: [] };

    return (
        <Box>
            <PageHeader title={t('kanban.title')} subtitle="Drag and drop to update task status">
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
                    <Box 
                        sx={{ 
                            minWidth: 250,
                            '& .MuiInputBase-root': {
                                height: '56px'
                            }
                        }}
                    >
                        <ProjectSelector
                            value={Number(selectedProjectId)}
                            onChange={(id) => setSelectedProjectId(id.toString())}
                            label=""
                            containerSx={{ mb: 0 }}
                        />
                    </Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsCreateModalOpen(true)}
                        sx={{ height: '56px' }}
                    >
                        {t('kanban.newTask')}
                    </Button>
                </Box>
            </PageHeader>

            {/* Kanban Columns */}
            <Box
                sx={{
                    display: 'flex',
                    gap: 3,
                    overflowX: 'auto',
                    pb: 2,
                    minHeight: 'calc(100vh - 250px)',
                }}
            >
                {columns.map((column) => {
                    const columnTasks = tasks[column.id as keyof typeof tasks] || [];
                    const isDropping = dropTarget === column.id;

                    return (
                        <Box
                            key={column.id}
                            sx={{
                                minWidth: 320,
                                flex: '0 0 320px',
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                            onDragOver={(e) => handleDragOver(e, column.id)}
                            onDragLeave={handleDragLeave}
                            onDrop={(e) => handleDrop(e, column.id)}
                        >
                            {/* Column Header */}
                            <Box
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    p: 2,
                                    borderRadius: 2,
                                    backgroundColor: column.bgColor,
                                    borderLeft: 4,
                                    borderColor: column.color,
                                    mb: 2,
                                }}
                            >
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {column.label}
                                </Typography>
                                <Chip
                                    label={columnTasks.length}
                                    size="small"
                                    sx={{
                                        backgroundColor: alpha(column.color, 0.2),
                                        color: column.color,
                                        fontWeight: 700,
                                    }}
                                />
                            </Box>

                            {/* Task Cards */}
                            <Box
                                sx={{
                                    flex: 1,
                                    minHeight: 200,
                                    p: 1,
                                    borderRadius: 2,
                                    backgroundColor: isDropping
                                        ? (theme) => alpha(theme.palette.primary.main, 0.08)
                                        : 'transparent',
                                    border: 2,
                                    borderColor: isDropping ? 'primary.main' : 'transparent',
                                    borderStyle: 'dashed',
                                    transition: 'all 0.2s ease',
                                }}
                            >
                                {columnTasks.map((task, index) => (
                                    <Card
                                        key={task.id}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, task, column.id)}
                                        onDragEnd={handleDragEnd}
                                        sx={{
                                            mb: 2,
                                            cursor: 'grab',
                                            transition: 'all 0.2s ease',
                                            animation: 'fadeInUp 0.3s ease-out',
                                            animationDelay: `${index * 50}ms`,
                                            animationFillMode: 'backwards',
                                            '&:hover': {
                                                transform: 'translateY(-2px) scale(1.01)',
                                                boxShadow: (theme) => theme.shadows[8],
                                            },
                                            '&:active': {
                                                cursor: 'grabbing',
                                                transform: 'rotate(2deg) scale(1.02)',
                                            },
                                        }}
                                    >
                                        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                                            {/* Drag Handle & Priority */}
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    justifyContent: 'space-between',
                                                    alignItems: 'center',
                                                    mb: 1,
                                                }}
                                            >
                                                <DragIcon
                                                    sx={{
                                                        fontSize: 18,
                                                        color: 'text.disabled',
                                                    }}
                                                />
                                                <Chip
                                                    label={priorityConfig[task.priority].label}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: '0.65rem',
                                                        fontWeight: 700,
                                                        backgroundColor: alpha(
                                                            priorityConfig[task.priority].color,
                                                            0.15
                                                        ),
                                                        color: priorityConfig[task.priority].color,
                                                    }}
                                                />
                                            </Box>

                                            {/* Title */}
                                            <Typography
                                                variant="subtitle2"
                                                fontWeight={600}
                                                sx={{
                                                    mb: 1,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {task.title}
                                            </Typography>

                                            {/* Description */}
                                            {task.description && (
                                                <Typography
                                                    variant="body2"
                                                    color="text.secondary"
                                                    sx={{
                                                        mb: 1.5,
                                                        fontSize: '0.8rem',
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                    }}
                                                >
                                                    {task.description}
                                                </Typography>
                                            )}

                                            {/* Due Date */}
                                            {task.due_date && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 0.5,
                                                        mb: 1.5,
                                                    }}
                                                >
                                                    <CalendarIcon
                                                        sx={{ fontSize: 14, color: 'text.secondary' }}
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        color="text.secondary"
                                                    >
                                                        {new Date(task.due_date).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            )}

                                            {/* Assignees */}
                                            {task.assignees && task.assignees.length > 0 && (
                                                <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                                    <AvatarGroup
                                                        max={3}
                                                        sx={{
                                                            '& .MuiAvatar-root': {
                                                                width: 28,
                                                                height: 28,
                                                                fontSize: '0.75rem',
                                                                fontWeight: 600,
                                                                border: 2,
                                                                borderColor: 'background.paper',
                                                            },
                                                        }}
                                                    >
                                                        {task.assignees.map((assignee) => (
                                                            <Tooltip
                                                                key={assignee.id}
                                                                title={assignee.name}
                                                            >
                                                                <Avatar
                                                                    src={assignee.avatar}
                                                                    sx={{
                                                                        bgcolor: 'primary.main',
                                                                    }}
                                                                >
                                                                    {assignee.name
                                                                        .charAt(0)
                                                                        .toUpperCase()}
                                                                </Avatar>
                                                            </Tooltip>
                                                        ))}
                                                    </AvatarGroup>
                                                </Box>
                                            )}
                                        </CardContent>
                                    </Card>
                                ))}

                                {/* Empty State */}
                                {columnTasks.length === 0 && (
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            height: 120,
                                            color: 'text.secondary',
                                            fontSize: '0.875rem',
                                        }}
                                    >
                                        Drop tasks here
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>

            {/* Create Task Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={t('tasks.createTask')}
            >
                <TaskForm
                    initialProjectId={selectedProjectId ? parseInt(selectedProjectId) : undefined}
                    onSuccess={() => setIsCreateModalOpen(false)}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>
        </Box>
    );
}
