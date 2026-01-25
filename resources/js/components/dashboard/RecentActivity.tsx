import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

interface RecentItem {
    id: number;
    title: string;
    type: 'project' | 'task';
    status?: string;
    priority?: string;
    updatedAt: string;
}

interface RecentActivityProps {
    items: RecentItem[];
    type: 'projects' | 'tasks';
}

const statusColors: Record<string, string> = {
    active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    completed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    done: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    planning: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    on_hold: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    todo: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300',
    in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    review: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
    high: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

export default function RecentActivity({ items, type }: RecentActivityProps) {
    const { t } = useTranslation();
    
    function formatDate(dateString: string): string {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return t('dashboard.justNow');
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}${t('dashboard.minutesAgo')}`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}${t('dashboard.hoursAgo')}`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}${t('dashboard.daysAgo')}`;

        return date.toLocaleDateString();
    }

    const getStatusLabel = (status: string, itemType: 'project' | 'task'): string => {
        if (itemType === 'project') {
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
                    return status.replace('_', ' ');
            }
        } else {
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
                    return status.replace('_', ' ');
            }
        }
    };

    const getPriorityLabel = (priority: string): string => {
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
    const getLink = (item: RecentItem) => {
        if (item.type === 'project') {
            return `/projects/${item.id}/edit`;
        }
        return `/tasks/${item.id}/edit`;
    };

    return (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {type === 'projects' ? t('dashboard.recentProjects') : t('dashboard.recentTasks')}
                </h3>
                <Link
                    to={`/${type}`}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                >
                    {t('dashboard.viewAll')} →
                </Link>
            </div>
            <div className="space-y-3">
                {items.length === 0 ? (
                    <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                        {type === 'projects' ? t('dashboard.noRecentProjects') : t('dashboard.noRecentTasks')}
                    </p>
                ) : (
                    items.slice(0, 5).map((item) => (
                        <Link
                            key={item.id}
                            to={getLink(item)}
                            className="block p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                                        {item.title}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        {item.status && (
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.status] || statusColors.planning}`}
                                            >
                                                {getStatusLabel(item.status, item.type)}
                                            </span>
                                        )}
                                        {item.priority && (
                                            <span
                                                className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[item.priority] || statusColors.medium}`}
                                            >
                                                {getPriorityLabel(item.priority)}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <span className="text-xs text-gray-500 dark:text-gray-400 ml-2 whitespace-nowrap">
                                    {formatDate(item.updatedAt)}
                                </span>
                            </div>
                        </Link>
                    ))
                )}
            </div>
        </div>
    );
}
