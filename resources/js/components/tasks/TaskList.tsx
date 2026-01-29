import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, TaskListResponse } from '@/services/tasks';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    Box,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Typography,
    Tooltip,
    Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    ViewKanban as KanbanIcon,
    ArrowUpward as AscIcon,
    ArrowDownward as DescIcon,
} from '@mui/icons-material';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import useDebounce from '@/hooks/useDebounce';
import Modal from '@/components/ui/Modal';
import TaskForm from './TaskForm';
import { PageHeader, StatusChip, EmptyState, SearchInput, ConfirmDialog } from '@/components/ui';
import type { Task } from '@/types';

export default function TaskList() {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [priorityFilter, setPriorityFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<string>('created_at');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const debouncedSearch = useDebounce(searchQuery, 300);

    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [deletingTask, setDeletingTask] = useState<Task | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<TaskListResponse>({
        queryKey: ['tasks', statusFilter, priorityFilter, debouncedSearch, sortBy, sortOrder],
        queryFn: ({ pageParam }) =>
            taskService.getTasks(
                {
                    ...(statusFilter ? { status: statusFilter as any } : {}),
                    ...(priorityFilter ? { priority: priorityFilter as any } : {}),
                    ...(debouncedSearch ? { search: debouncedSearch } : {}),
                    sort_by: sortBy as any,
                    sort_order: sortOrder,
                },
                pageParam as number
            ),
        initialPageParam: 1,
        getNextPageParam: (lastPage) => {
            const { current_page, last_page } = lastPage.pagination || {};
            if (current_page && last_page && current_page < last_page) {
                return current_page + 1;
            }
            return undefined;
        },
    });

    const [loadMoreRef, isLoadMoreVisible] = useIntersectionObserver({
        rootMargin: '200px',
    });

    useEffect(() => {
        if (isLoadMoreVisible && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isLoadMoreVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const deleteMutation = useMutation({
        mutationFn: taskService.deleteTask,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['tasks'] });
            setIsDeleteDialogOpen(false);
            setDeletingTask(null);
        },
    });

    const openEditModal = (taskId: number) => {
        setEditingTaskId(taskId);
        setIsEditModalOpen(true);
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setTimeout(() => setEditingTaskId(null), 300);
    };

    const openDeleteDialog = (task: Task) => {
        setDeletingTask(task);
        setIsDeleteDialogOpen(true);
    };

    // Flatten and deduplicate tasks
    const allTasks = data?.pages.flatMap((page) => page.data) || [];
    const seenIds = new Set<number>();
    const tasks = allTasks.filter((task) => {
        if (seenIds.has(task.id)) return false;
        seenIds.add(task.id);
        return true;
    });

    return (
        <Box>
            <PageHeader
                title={t('tasks.title')}
                subtitle={`${tasks.length} tasks`}
            >
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <Button
                        component={Link}
                        to="/tasks/kanban"
                        variant="outlined"
                        startIcon={<KanbanIcon />}
                    >
                        {t('tasks.kanbanView')}
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setIsCreateModalOpen(true)}
                    >
                        {t('tasks.newTask')}
                    </Button>
                </Box>
            </PageHeader>

            {/* Filters */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', md: 'row' },
                    gap: 2,
                    mb: 4,
                    flexWrap: 'wrap',
                }}
            >
                <Box sx={{ flex: 1, minWidth: 200 }}>
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t('tasks.searchTasks')}
                    />
                </Box>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>{t('tasks.allStatuses')}</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label={t('tasks.allStatuses')}
                    >
                        <MenuItem value="">{t('tasks.allStatuses')}</MenuItem>
                        <MenuItem value="todo">{t('tasks.statusTodo')}</MenuItem>
                        <MenuItem value="in_progress">{t('tasks.statusInProgress')}</MenuItem>
                        <MenuItem value="review">{t('tasks.statusReview')}</MenuItem>
                        <MenuItem value="done">{t('tasks.statusDone')}</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>{t('tasks.allPriorities')}</InputLabel>
                    <Select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        label={t('tasks.allPriorities')}
                    >
                        <MenuItem value="">{t('tasks.allPriorities')}</MenuItem>
                        <MenuItem value="low">{t('tasks.priorityLow')}</MenuItem>
                        <MenuItem value="medium">{t('tasks.priorityMedium')}</MenuItem>
                        <MenuItem value="high">{t('tasks.priorityHigh')}</MenuItem>
                        <MenuItem value="urgent">{t('tasks.priorityUrgent')}</MenuItem>
                    </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 140 }}>
                    <InputLabel>Sort By</InputLabel>
                    <Select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        label="Sort By"
                    >
                        <MenuItem value="title">{t('tasks.sortByTitle')}</MenuItem>
                        <MenuItem value="created_at">{t('tasks.sortByCreatedDate')}</MenuItem>
                        <MenuItem value="due_date">{t('tasks.sortByDueDate')}</MenuItem>
                        <MenuItem value="priority">{t('tasks.sortByPriority')}</MenuItem>
                        <MenuItem value="status">{t('tasks.sortByStatus')}</MenuItem>
                    </Select>
                </FormControl>

                <Tooltip title={sortOrder === 'asc' ? t('tasks.ascending') : t('tasks.descending')}>
                    <IconButton
                        onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        sx={{
                            border: 1,
                            borderColor: 'divider',
                            borderRadius: 2,
                        }}
                    >
                        {sortOrder === 'asc' ? <AscIcon /> : <DescIcon />}
                    </IconButton>
                </Tooltip>
            </Box>

            {/* Tasks Table */}
            {isLoading ? (
                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {['Task', 'Project', 'Status', 'Priority', 'Due Date', 'Actions'].map((h) => (
                                    <TableCell key={h}>{h}</TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {[1, 2, 3, 4, 5].map((i) => (
                                <TableRow key={i}>
                                    <TableCell><Skeleton width="80%" /></TableCell>
                                    <TableCell><Skeleton width="60%" /></TableCell>
                                    <TableCell><Skeleton width={80} /></TableCell>
                                    <TableCell><Skeleton width={60} /></TableCell>
                                    <TableCell><Skeleton width={100} /></TableCell>
                                    <TableCell><Skeleton width={80} /></TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : isError ? (
                <EmptyState type="error" title={t('tasks.errorLoadingTasks')} />
            ) : tasks.length === 0 ? (
                <EmptyState
                    type="tasks"
                    action={
                        searchQuery || statusFilter || priorityFilter
                            ? {
                                  label: t('tasks.clearAllFilters'),
                                  onClick: () => {
                                      setSearchQuery('');
                                      setStatusFilter('');
                                      setPriorityFilter('');
                                  },
                              }
                            : {
                                  label: t('tasks.createFirstTask'),
                                  onClick: () => setIsCreateModalOpen(true),
                              }
                    }
                />
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ mb: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('tasks.taskTitle')}</TableCell>
                                    <TableCell>{t('tasks.project')}</TableCell>
                                    <TableCell>{t('tasks.status')}</TableCell>
                                    <TableCell>{t('tasks.priority')}</TableCell>
                                    <TableCell>{t('tasks.dueDate')}</TableCell>
                                    <TableCell align="right">{t('common.actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {tasks.map((task, index) => (
                                    <TableRow
                                        key={task.id}
                                        sx={{
                                            animation: 'fadeInUp 0.3s ease-out',
                                            animationDelay: `${(index % 10) * 30}ms`,
                                            animationFillMode: 'backwards',
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {task.title}
                                            </Typography>
                                            {task.description && (
                                                <Typography
                                                    variant="caption"
                                                    color="text.secondary"
                                                    sx={{
                                                        display: 'block',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        whiteSpace: 'nowrap',
                                                        maxWidth: 300,
                                                    }}
                                                >
                                                    {task.description}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {task.project?.name || 'N/A'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip status={task.status} />
                                        </TableCell>
                                        <TableCell>
                                            <StatusChip priority={task.priority} />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {task.due_date
                                                    ? new Date(task.due_date).toLocaleDateString()
                                                    : '-'}
                                            </Typography>
                                        </TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                                <Tooltip title={t('common.edit')}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openEditModal(task.id)}
                                                        sx={{
                                                            color: 'info.main',
                                                            '&:hover': {
                                                                backgroundColor: (theme) =>
                                                                    alpha(theme.palette.info.main, 0.1),
                                                            },
                                                        }}
                                                    >
                                                        <EditIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title={t('common.delete')}>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => openDeleteDialog(task)}
                                                        sx={{
                                                            color: 'error.main',
                                                            '&:hover': {
                                                                backgroundColor: (theme) =>
                                                                    alpha(theme.palette.error.main, 0.1),
                                                            },
                                                        }}
                                                    >
                                                        <DeleteIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Infinite Scroll Sensor */}
                    <Box ref={loadMoreRef} sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                        {isFetchingNextPage ? (
                            <Typography color="text.secondary">{t('tasks.loadingMoreTasks')}</Typography>
                        ) : hasNextPage ? (
                            <Typography variant="body2" color="text.secondary">
                                {t('tasks.scrollToLoadMore')}
                            </Typography>
                        ) : (
                            tasks.length > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    {t('tasks.noMoreTasks')}
                                </Typography>
                            )
                        )}
                    </Box>
                </>
            )}

            {/* Modals */}
            <Modal isOpen={isCreateModalOpen} onClose={closeModals} title={t('tasks.createTask')}>
                <TaskForm onSuccess={closeModals} onCancel={closeModals} />
            </Modal>

            <Modal isOpen={isEditModalOpen} onClose={closeModals} title={t('tasks.editTask')}>
                {editingTaskId && (
                    <TaskForm taskId={editingTaskId} onSuccess={closeModals} onCancel={closeModals} />
                )}
            </Modal>

            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => deletingTask && deleteMutation.mutate(deletingTask.id)}
                title="Delete Task"
                message={`Are you sure you want to delete "${deletingTask?.title}"? This action cannot be undone.`}
                confirmLabel="Delete"
                variant="danger"
                loading={deleteMutation.isPending}
            />
        </Box>
    );
}
