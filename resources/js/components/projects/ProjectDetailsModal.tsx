import { useQuery } from '@tanstack/react-query';
import { projectService } from '@/services/projects';
import { taskService } from '@/services/tasks';
import Modal from '@/components/ui/Modal';
import { useState } from 'react';
import type { Project, Task } from '@/types';

interface ProjectDetailsModalProps {
    projectId: number;
    isOpen: boolean;
    onClose: () => void;
}

const statusColors: Record<Project['status'], string> = {
    planning: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
};

const taskStatusColors: Record<Task['status'], string> = {
    todo: 'bg-gray-100 text-gray-800',
    in_progress: 'bg-blue-100 text-blue-800',
    review: 'bg-yellow-100 text-yellow-800',
    done: 'bg-green-100 text-green-800',
};

const priorityColors: Record<Task['priority'], string> = {
    low: 'bg-gray-200 text-gray-700',
    medium: 'bg-blue-200 text-blue-700',
    high: 'bg-orange-200 text-orange-700',
    urgent: 'bg-red-200 text-red-700',
};

export default function ProjectDetailsModal({ projectId, isOpen, onClose }: ProjectDetailsModalProps) {
    const [activeTab, setActiveTab] = useState<'details' | 'tasks' | 'members'>('details');

    const { data: project, isLoading: isLoadingProject } = useQuery({
        queryKey: ['project', projectId],
        queryFn: () => projectService.getProject(projectId),
        enabled: isOpen && projectId > 0,
    });

    const { data: tasksData, isLoading: isLoadingTasks } = useQuery({
        queryKey: ['project-tasks', projectId],
        queryFn: () => taskService.getTasks({ project_id: projectId }, 1, 100),
        enabled: isOpen && activeTab === 'tasks' && projectId > 0,
    });

    const tasks = tasksData?.data || [];

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={project ? project.name : 'Loading...'}>
            {isLoadingProject ? (
                <div className="flex justify-center items-center h-48">
                    <div className="text-gray-500 animate-pulse">Loading project details...</div>
                </div>
            ) : project ? (
                <div className="space-y-6">
                    {/* Header Summary */}
                    <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
                            {project.status.toUpperCase().replace('_', ' ')}
                        </span>
                        <div className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">Budget:</span> ${project.budget?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-600">
                            <span className="font-semibold text-gray-900">Timeline:</span> {formatDate(project.start_date)} - {formatDate(project.end_date)}
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200">
                        <button
                            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                                activeTab === 'details'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('details')}
                        >
                            Overview
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                                activeTab === 'tasks'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('tasks')}
                        >
                            Tasks
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                                activeTab === 'members'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('members')}
                        >
                            Members
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[200px]">
                        {activeTab === 'details' && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">Description</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {project.description || 'No description provided.'}
                                    </p>
                                </div>
                                
                                {project.settings && Object.keys(project.settings).length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">Additional Settings</h4>
                                        <pre className="bg-gray-50 p-3 rounded text-xs text-gray-600 overflow-x-auto">
                                            {JSON.stringify(project.settings, null, 2)}
                                        </pre>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'tasks' && (
                            <div className="space-y-3">
                                {isLoadingTasks ? (
                                    <div className="text-center py-4 text-gray-500">Loading tasks...</div>
                                ) : tasks.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed border-gray-200">
                                        No tasks found for this project.
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {tasks.map((task) => (
                                            <div key={task.id} className="p-3 bg-white border border-gray-200 rounded hover:shadow-sm transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-medium text-gray-900 text-sm">{task.title}</h5>
                                                    <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${taskStatusColors[task.status]}`}>
                                                        {task.status.replace('_', ' ')}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                    <span className={`px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                                                        {task.priority}
                                                    </span>
                                                    <span>Due: {formatDate(task.due_date)}</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'members' && (
                            <div className="space-y-3">
                                {project.members && project.members.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                        {project.members.map((member) => (
                                            <div key={member.id} className="flex items-center p-3 bg-gray-50 rounded border border-gray-100">
                                                <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-semibold text-xs mr-3">
                                                    {member.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="text-sm font-medium text-gray-900">{member.name}</div>
                                                    <div className="text-xs text-gray-500">{member.email}</div>
                                                    <div className="text-xs text-gray-400 mt-0.5">
                                                        Role: {member.pivot?.role || 'Member'}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed border-gray-200">
                                        No members assigned to this project.
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="p-4 text-red-500">Project not found.</div>
            )}
        </Modal>
    );
}
