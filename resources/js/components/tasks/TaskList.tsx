import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService, TaskListResponse } from '@/services/tasks';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

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
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [priorityFilter, setPriorityFilter] = useState<string>('');
    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<TaskListResponse>({
        queryKey: ['tasks', statusFilter, priorityFilter],
        queryFn: ({ pageParam }) => taskService.getTasks(
            {
                ...(statusFilter ? { status: statusFilter as any } : {}),
                ...(priorityFilter ? { priority: priorityFilter as any } : {}),
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
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">Loading tasks...</div>
            </div>
        );
    }

    if (isError) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded">
                Error loading tasks. Please try again.
            </div>
        );
    }

    const tasks = data?.pages.flatMap((page) => page.data) || [];

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Tasks</h2>
                <div className="flex gap-2">
                    <Link
                        to="/tasks/kanban"
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        Kanban View
                    </Link>
                    <Link
                        to="/tasks/create"
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                    >
                        + New Task
                    </Link>
                </div>
            </div>

            {/* Filters */}
            <div className="mb-4 flex gap-2">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                >
                    <option value="">All Statuses</option>
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="review">Review</option>
                    <option value="done">Done</option>
                </select>
                <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                </select>
            </div>

            {/* Tasks Table */}
            {tasks.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="mb-4">No tasks found.</p>
                    <Link
                        to="/tasks/create"
                        className="text-blue-600 hover:text-blue-700"
                    >
                        Create your first task
                    </Link>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Due Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
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
                                                {task.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span
                                                className={`px-2 py-1 text-xs rounded ${
                                                    priorityColors[task.priority]
                                                }`}
                                            >
                                                {task.priority}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-600">
                                            {task.due_date
                                                ? new Date(task.due_date).toLocaleDateString()
                                                : '-'}
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <div className="flex gap-2">
                                                <Link
                                                    to={`/tasks/${task.id}/edit`}
                                                    className="text-blue-600 hover:text-blue-800"
                                                >
                                                    Edit
                                                </Link>
                                                <button
                                                    onClick={() => {
                                                        if (confirm('Are you sure you want to delete this task?')) {
                                                            deleteMutation.mutate(task.id);
                                                        }
                                                    }}
                                                    className="text-red-600 hover:text-red-800"
                                                    disabled={deleteMutation.isPending}
                                                >
                                                    {deleteMutation.isPending ? '...' : 'Delete'}
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
                            <div className="text-gray-500 animate-pulse">Loading more tasks...</div>
                        ) : hasNextPage ? (
                            <div className="text-gray-400 text-sm">Scroll to load more</div>
                        ) : (
                            tasks.length > 0 && <div className="text-gray-400 text-sm">No more tasks to load</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
