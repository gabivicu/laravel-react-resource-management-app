import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, TaskListResponse } from '@/services/tasks';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import useDebounce from '@/hooks/useDebounce';
import Modal from '@/components/ui/Modal';
import TaskForm from './TaskForm';
import TaskDeleteModal from './TaskDeleteModal';
import type { Task } from '@/types';

const statusColors = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
};

const priorityColors = {
    low: 'bg-gray-200 text-gray-700',
    medium: 'bg-blue-200 text-blue-700',
    high: 'bg-orange-200 text-orange-700',
    urgent: 'bg-red-200 text-red-700',
};

export default function TaskList() {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [priorityFilter, setPriorityFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<string>('title');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const searchInputRef = useRef<HTMLInputElement>(null);
    
    const [editingTaskId, setEditingTaskId] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    // Delete modal state
    const [taskToDelete, setTaskToDelete] = useState<Task | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

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
        queryFn: ({ pageParam }) => taskService.getTasks(
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
            setIsDeleteModalOpen(false);
            setTaskToDelete(null);
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

    const openDeleteModal = (task: Task) => {
        setTaskToDelete(task);
        setIsDeleteModalOpen(true);
    };

    const closeDeleteModal = () => {
        setIsDeleteModalOpen(false);
        setTimeout(() => setTaskToDelete(null), 300);
    };

    const handleDeleteConfirm = () => {
        if (taskToDelete) {
            deleteMutation.mutate(taskToDelete.id);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">{t('tasks.loadingTasks')}</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded">
                {t('tasks.errorLoadingTasks')}
            </div>
        );
    }

    // Flatten and deduplicate tasks to avoid duplicate keys
    // Important: Maintain sort order from backend by processing pages in order
    const allTasks = data?.pages.flatMap((page) => page.data) || [];
    
    // Deduplicate while preserving order (keep first occurrence)
    const seenIds = new Set<number>();
    const tasks = allTasks.filter((task) => {
        if (seenIds.has(task.id)) {
            return false; // Skip duplicates
        }
        seenIds.add(task.id);
        return true;
    });

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t('tasks.title')}</h2>
                <div className="flex gap-2">
                    <Link
                        to="/tasks/kanban"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        {t('tasks.kanbanView')}
                    </Link>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                    >
                        + {t('tasks.newTask')}
                    </button>
                </div>
            </div>

            {/* Filters & Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <input
                        ref={searchInputRef}
                        type="text"
                        placeholder={t('tasks.searchTasks')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <svg
                        className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                        />
                    </svg>
                    {searchQuery && (
                        <button
                            onClick={() => setSearchQuery('')}
                            className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                        >
                            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Status Filter */}
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">{t('tasks.allStatuses')}</option>
                    <option value="todo">{t('tasks.statusTodo')}</option>
                    <option value="in_progress">{t('tasks.statusInProgress')}</option>
                    <option value="review">{t('tasks.statusReview')}</option>
                    <option value="done">{t('tasks.statusDone')}</option>
                </select>

                {/* Priority Filter */}
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="">{t('tasks.allPriorities')}</option>
                    <option value="low">{t('tasks.priorityLow')}</option>
                    <option value="medium">{t('tasks.priorityMedium')}</option>
                    <option value="high">{t('tasks.priorityHigh')}</option>
                    <option value="urgent">{t('tasks.priorityUrgent')}</option>
                </select>

                {/* Sort By */}
                <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                    <option value="title">{t('tasks.sortByTitle')}</option>
                    <option value="created_at">{t('tasks.sortByCreatedDate')}</option>
                    <option value="due_date">{t('tasks.sortByDueDate')}</option>
                    <option value="priority">{t('tasks.sortByPriority')}</option>
                    <option value="status">{t('tasks.sortByStatus')}</option>
                </select>

                {/* Sort Order */}
                <button
                    onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    className="px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex items-center gap-1"
                    title={sortOrder === 'asc' ? t('tasks.ascending') : t('tasks.descending')}
                >
                    {sortOrder === 'asc' ? (
                        <>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                            </svg>
                            <span className="hidden sm:inline">{t('tasks.ascending')}</span>
                        </>
                    ) : (
                        <>
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h9m5-4v12m0 0l-4-4m4 4l4-4" />
                            </svg>
                            <span className="hidden sm:inline">{t('tasks.descending')}</span>
                        </>
                    )}
                </button>
            </div>

            {/* Tasks Table */}
            {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="mb-4">{t('tasks.noTasksFound')}</p>
                    {(searchQuery || statusFilter || priorityFilter || sortBy !== 'title' || sortOrder !== 'desc') ? (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('');
                                setPriorityFilter('');
                                setSortBy('title');
                                setSortOrder('desc');
                            }}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            {t('tasks.clearAllFilters')}
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            {t('tasks.createFirstTask')}
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tasks.taskTitle')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tasks.project')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tasks.status')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tasks.priority')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('tasks.dueDate')}</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">{t('common.actions')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {tasks.map((task) => (
                                    <tr key={task.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{task.title}</div>
                                            {task.description && (
                                                <div className="text-sm text-gray-500 line-clamp-1">
                                                    {task.description}
                                                </div>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {task.project?.name || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${
                                                    statusColors[task.status]
                                                }`}
                                            >
                                                {task.status === 'todo' && t('tasks.statusTodo')}
                                                {task.status === 'in_progress' && t('tasks.statusInProgress')}
                                                {task.status === 'review' && t('tasks.statusReview')}
                                                {task.status === 'done' && t('tasks.statusDone')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${
                                                    priorityColors[task.priority]
                                                }`}
                                            >
                                                {task.priority === 'low' && t('tasks.priorityLow')}
                                                {task.priority === 'medium' && t('tasks.priorityMedium')}
                                                {task.priority === 'high' && t('tasks.priorityHigh')}
                                                {task.priority === 'urgent' && t('tasks.priorityUrgent')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {task.due_date
                                                ? new Date(task.due_date).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => openEditModal(task.id)}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    {t('common.edit')}
                                                </button>
                                                <button
                                                    onClick={() => openDeleteModal(task)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    {t('common.delete')}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Infinite Scroll Sensor */}
                    <div ref={loadMoreRef} className="py-8 flex justify-center">
                        {isFetchingNextPage ? (
                            <div className="text-gray-500 animate-pulse">{t('tasks.loadingMoreTasks')}</div>
                        ) : hasNextPage ? (
                            <div className="text-gray-400 text-sm">{t('tasks.scrollToLoadMore')}</div>
                        ) : (
                            tasks.length > 0 && <div className="text-gray-400 text-sm">{t('tasks.noMoreTasks')}</div>
                        )}
                    </div>
                </>
            )}

            <Modal
                isOpen={isCreateModalOpen}
                onClose={closeModals}
                title={t('tasks.createTask')}
            >
                <TaskForm
                    onSuccess={closeModals}
                    onCancel={closeModals}
                />
            </Modal>

            <Modal
                isOpen={isEditModalOpen}
                onClose={closeModals}
                title={t('tasks.editTask')}
            >
                {editingTaskId && (
                    <TaskForm
                        taskId={editingTaskId}
                        onSuccess={closeModals}
                        onCancel={closeModals}
                    />
                )}
            </Modal>

            <TaskDeleteModal
                isOpen={isDeleteModalOpen}
                onClose={closeDeleteModal}
                onConfirm={handleDeleteConfirm}
                task={taskToDelete}
                isDeleting={deleteMutation.isPending}
            />
        </div>
    );
}
