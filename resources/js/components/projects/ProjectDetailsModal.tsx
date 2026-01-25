import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { projectService } from '@/services/projects';
import { taskService } from '@/services/tasks';
import Modal from '@/components/ui/Modal';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const { t } = useTranslation();
    const [activeTab, setActiveTab] = useState<'details' | 'tasks' | 'members'>('details');
    const navigate = useNavigate();

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

    const getTaskStatusLabel = (status: Task['status']): string => {
        switch (status) {
            case 'todo':
                return t('tasks.statusTodo');
            case 'in_progress':
                return t('tasks.statusInProgress');
            case 'review':
                return t('tasks.statusReview');
            case 'done':
                return t('tasks.statusDone');
            default:
                return String(status).replace('_', ' ');
        }
    };

    const getTaskPriorityLabel = (priority: Task['priority']): string => {
        switch (priority) {
            case 'low':
                return t('tasks.priorityLow');
            case 'medium':
                return t('tasks.priorityMedium');
            case 'high':
                return t('tasks.priorityHigh');
            case 'urgent':
                return t('tasks.priorityUrgent');
            default:
                return priority;
        }
    };

    const getStatusLabel = (status: Project['status']): string => {
        switch (status) {
            case 'planning':
                return t('projects.statusPlanning');
            case 'active':
                return t('projects.statusActive');
            case 'on_hold':
                return t('projects.statusOnHold');
            case 'completed':
                return t('projects.statusCompleted');
            case 'cancelled':
                return t('projects.statusCancelled');
            default:
                return String(status).replace('_', ' ');
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={project ? project.name : t('common.loading')}>
            {isLoadingProject ? (
                <div className="flex justify-center items-center h-48">
                    <div className="text-gray-500 animate-pulse">{t('projects.loadingProjectDetails')}</div>
                </div>
            ) : project ? (
                <div className="space-y-6">
                    {/* Header Summary */}
                    <div className="flex flex-wrap gap-4 items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[project.status]}`}>
                                {getStatusLabel(project.status)}
                            </span>
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-900">{t('projects.budgetLabel')}:</span> ${project.budget?.toLocaleString() || '0'}
                            </div>
                            <div className="text-sm text-gray-600">
                                <span className="font-semibold text-gray-900">{t('projects.timeline')}:</span> {formatDate(project.start_date)} - {formatDate(project.end_date)}
                            </div>
                        </div>
                        <button
                            onClick={() => navigate(`/tasks/kanban?project_id=${projectId}`)}
                            className="px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded hover:bg-blue-700 transition-colors flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
                            </svg>
                            {t('projects.kanbanBoard')}
                        </button>
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
                            {t('projects.overview')}
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                                activeTab === 'tasks'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('tasks')}
                        >
                            {t('projects.tasks')}
                        </button>
                        <button
                            className={`px-4 py-2 font-medium text-sm focus:outline-none ${
                                activeTab === 'members'
                                    ? 'text-blue-600 border-b-2 border-blue-600'
                                    : 'text-gray-500 hover:text-gray-700'
                            }`}
                            onClick={() => setActiveTab('members')}
                        >
                            {t('projects.members')}
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="min-h-[200px]">
                        {activeTab === 'details' && (
                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-gray-900 mb-1">{t('projects.description')}</h4>
                                    <p className="text-gray-600 text-sm leading-relaxed">
                                        {project.description || t('projects.noDescriptionProvided')}
                                    </p>
                                </div>
                                
                                {project.settings && Object.keys(project.settings).length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-1">{t('projects.additionalSettings')}</h4>
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
                                    <div className="text-center py-4 text-gray-500">{t('tasks.loadingTasks')}</div>
                                ) : tasks.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed border-gray-200">
                                        {t('projects.noTasksFoundForProject')}
                                    </div>
                                ) : (
                                    <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                                        {tasks.map((task) => (
                                            <div key={task.id} className="p-3 bg-white border border-gray-200 rounded hover:shadow-sm transition-shadow">
                                                <div className="flex justify-between items-start mb-2">
                                                    <h5 className="font-medium text-gray-900 text-sm">{task.title}</h5>
                                                    <span className={`px-2 py-0.5 rounded text-xs whitespace-nowrap ${taskStatusColors[task.status]}`}>
                                                        {getTaskStatusLabel(task.status)}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between items-center text-xs text-gray-500">
                                                    <span className={`px-1.5 py-0.5 rounded ${priorityColors[task.priority]}`}>
                                                        {getTaskPriorityLabel(task.priority)}
                                                    </span>
                                                    <span>{t('tasks.dueDate')}: {formatDate(task.due_date)}</span>
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
                                                        {t('projects.role')}: {member.pivot?.role || t('projects.member')}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded border border-dashed border-gray-200">
                                        {t('projects.noMembersAssigned')}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="p-4 text-red-500">{t('projects.projectNotFound')}</div>
            )}
        </Modal>
    );
}
