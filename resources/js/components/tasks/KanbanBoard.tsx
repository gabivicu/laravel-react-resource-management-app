import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { taskService } from '@/services/tasks';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import type { Task } from '@/types';
import ProjectSelector from '@/components/projects/ProjectSelector';
import Modal from '@/components/ui/Modal';
import TaskForm from './TaskForm';

const statusConfig = {
    todo: { label: 'To Do', color: 'bg-gray-100', textColor: 'text-gray-800' },
    in_progress: { label: 'In Progress', color: 'bg-blue-100', textColor: 'text-blue-800' },
    review: { label: 'Review', color: 'bg-yellow-100', textColor: 'text-yellow-800' },
    done: { label: 'Done', color: 'bg-green-100', textColor: 'text-green-800' },
};

const priorityColors = {
    low: 'bg-gray-200 text-gray-700',
    medium: 'bg-blue-200 text-blue-700',
    high: 'bg-orange-200 text-orange-700',
    urgent: 'bg-red-200 text-red-700',
};

interface KanbanBoardProps {
    initialProjectId?: number;
}

export default function KanbanBoard({ initialProjectId }: KanbanBoardProps) {
    const queryClient = useQueryClient();
    const [searchParams] = useSearchParams();
    
    const [selectedProjectId, setSelectedProjectId] = useState<string>(
        searchParams.get('project_id') || (initialProjectId ? initialProjectId.toString() : '')
    );
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const [draggedTask, setDraggedTask] = useState<Task | null>(null);
    const [draggedFrom, setDraggedFrom] = useState<string | null>(null);

    useEffect(() => {
        if (!selectedProjectId) return;

        const channel = window.Echo.private(`projects.${selectedProjectId}`);

        channel.listen('.TaskMoved', (e: any) => {
            queryClient.setQueryData(['tasks', 'kanban', selectedProjectId], (old: any) => {
                if (!old) return old;

                const updated = { ...old };
                const taskData = e;
                let foundTask: Task | undefined;
                
                // Find existing task
                Object.keys(updated).forEach((status) => {
                    const statusTasks = updated[status] || [];
                    const index = statusTasks.findIndex((t: Task) => t.id === taskData.id);
                    if (index !== -1) {
                        foundTask = statusTasks[index];
                        // Remove from old position
                        updated[status] = statusTasks.filter((t: Task) => t.id !== taskData.id);
                    }
                });

                if (foundTask) {
                    // Update task properties
                    const updatedTask = { ...foundTask, ...taskData };
                    
                    // Add to new status array
                    const targetStatus = taskData.status as string;
                    const targetTasks = updated[targetStatus] || [];
                    
                    // Insert and sort
                    updated[targetStatus] = [...targetTasks, updatedTask].sort((a: Task, b: Task) => a.order - b.order);
                    
                    return updated;
                } else {
                    // Task not found locally, fetch fresh data
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

    const handleDragStart = (task: Task, status: string) => {
        setDraggedTask(task);
        setDraggedFrom(status);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = async (targetStatus: string) => {
        if (!draggedTask || !draggedFrom) return;

        const targetTasks = kanbanData?.[targetStatus as keyof typeof kanbanData] || [];
        const newOrder = targetTasks.length + 1;

        // Optimistic update
        queryClient.setQueryData(['tasks', 'kanban', selectedProjectId], (old: any) => {
            if (!old) return old;

            const updated = { ...old };
            
            // Remove from old status
            updated[draggedFrom!] = updated[draggedFrom!].filter((t: Task) => t.id !== draggedTask.id);
            
            // Add to new status
            updated[targetStatus] = [
                ...updated[targetStatus],
                { ...draggedTask, status: targetStatus as Task['status'], order: newOrder },
            ];

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
            <div>
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                    <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
                    <div className="flex gap-4 items-center w-full md:w-auto">
                        <div className="w-full md:w-64">
                            <ProjectSelector
                                value={selectedProjectId ? Number(selectedProjectId) : undefined}
                                onChange={(id) => setSelectedProjectId(id.toString())}
                                label=""
                            />
                        </div>
                    </div>
                </div>
                <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                    <div className="text-center text-gray-500">
                        <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                        <p className="text-lg font-medium mb-2">Select a project</p>
                        <p>Please select a project to view its Kanban board.</p>
                    </div>
                </div>
            </div>
        );
    }

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
                Error loading Kanban board: {(error as Error).message || 'Unknown error'}
            </div>
        );
    }

    const tasks = kanbanData || {
        todo: [],
        in_progress: [],
        review: [],
        done: [],
    };

    return (
        <div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Kanban Board</h2>
                <div className="flex gap-4 items-center w-full md:w-auto">
                    <div className="w-full md:w-64">
                        <ProjectSelector
                            value={selectedProjectId ? Number(selectedProjectId) : undefined}
                            onChange={(id) => setSelectedProjectId(id.toString())}
                            label=""
                        />
                    </div>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md whitespace-nowrap"
                    >
                        + New Task
                    </button>
                </div>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4">
            {Object.entries(statusConfig).map(([status, config]) => {
                const statusTasks = tasks[status as keyof typeof tasks] || [];
                
                return (
                    <div
                        key={status}
                        className="flex-shrink-0 w-80"
                        onDragOver={handleDragOver}
                        onDrop={() => handleDrop(status)}
                    >
                        <div className={`${config.color} ${config.textColor} p-3 rounded-t-lg font-semibold`}>
                            <div className="flex justify-between items-center">
                                <span>{config.label}</span>
                                <span className="text-sm bg-white bg-opacity-50 px-2 py-1 rounded">
                                    {statusTasks.length}
                                </span>
                            </div>
                        </div>
                        <div className="bg-gray-50 min-h-[400px] p-3 rounded-b-lg space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {statusTasks.map((task) => (
                                <div
                                    key={task.id}
                                    draggable
                                    onDragStart={() => handleDragStart(task, status)}
                                    className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md cursor-move transition-shadow"
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-medium text-gray-900">{task.title}</h4>
                                        <span
                                            className={`px-2 py-1 text-xs rounded ${
                                                priorityColors[task.priority]
                                            }`}
                                        >
                                            {task.priority}
                                        </span>
                                    </div>
                                    
                                    {task.description && (
                                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}

                                    {task.project && (
                                        <div className="text-xs text-gray-500 mb-1 font-medium text-blue-600">
                                            {task.project.name}
                                        </div>
                                    )}

                                    {task.due_date && (
                                        <div className="text-xs text-gray-500 mb-2">
                                            Due: {new Date(task.due_date).toLocaleDateString()}
                                        </div>
                                    )}

                                    {task.assignees && task.assignees.length > 0 && (
                                        <div className="flex gap-1 mt-2">
                                            {task.assignees.slice(0, 3).map((assignee) => (
                                                <div
                                                    key={assignee.id}
                                                    className="w-6 h-6 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center"
                                                    title={assignee.name}
                                                >
                                                    {assignee.name.charAt(0).toUpperCase()}
                                                </div>
                                            ))}
                                            {task.assignees.length > 3 && (
                                                <div className="w-6 h-6 rounded-full bg-gray-300 text-gray-700 text-xs flex items-center justify-center">
                                                    +{task.assignees.length - 3}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                );
            })}
            </div>

            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title="Create New Task"
            >
                <TaskForm
                    initialProjectId={selectedProjectId ? parseInt(selectedProjectId) : undefined}
                    onSuccess={() => setIsCreateModalOpen(false)}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>
        </div>
    );
}
