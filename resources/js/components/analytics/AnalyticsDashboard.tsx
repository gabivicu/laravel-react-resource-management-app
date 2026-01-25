import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';

export default function AnalyticsDashboard() {
    const { t } = useTranslation();
    const { data: dashboardStats } = useQuery({
        queryKey: ['analytics', 'dashboard'],
        queryFn: () => analyticsService.getDashboardStats(),
    });

    const { data: projectStats } = useQuery({
        queryKey: ['analytics', 'projects'],
        queryFn: () => analyticsService.getProjectStats(),
    });

    const { data: taskStats } = useQuery({
        queryKey: ['analytics', 'tasks'],
        queryFn: () => analyticsService.getTaskStats(),
    });

    const { data: resourceStats } = useQuery({
        queryKey: ['analytics', 'resources'],
        queryFn: () => analyticsService.getResourceStats(),
    });

    const { data: completionTrend } = useQuery({
        queryKey: ['analytics', 'task-completion-trend'],
        queryFn: () => analyticsService.getTaskCompletionTrend(30),
    });

    const statusChartData = projectStats?.by_status
        ? Object.entries(projectStats.by_status).map(([status, count]) => ({
              status,
              count,
          }))
        : [];

    const priorityChartData = taskStats?.by_priority
        ? Object.entries(taskStats.by_priority).map(([priority, count]) => ({
              priority,
              count,
          }))
        : [];

    const getProjectStatusLabel = (status: string): string => {
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
    };

    const getTaskPriorityLabel = (priority: string): string => {
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

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">{t('analytics.title')}</h2>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">{t('analytics.totalProjects')}</h3>
                    <p className="text-3xl font-bold mt-2">{dashboardStats?.projects || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">{t('analytics.totalTasks')}</h3>
                    <p className="text-3xl font-bold mt-2">{dashboardStats?.tasks || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">{t('analytics.users')}</h3>
                    <p className="text-3xl font-bold mt-2">{dashboardStats?.users || 0}</p>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-sm font-medium text-gray-500">{t('analytics.activeAllocations')}</h3>
                    <p className="text-3xl font-bold mt-2">{dashboardStats?.active_allocations || 0}</p>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Project Status Breakdown */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">{t('analytics.projectsByStatus')}</h3>
                    {statusChartData.length > 0 ? (
                        <div className="space-y-2">
                            {statusChartData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{getProjectStatusLabel(item.status)}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-blue-600 h-2 rounded-full"
                                                style={{ width: `${(item.count / (projectStats?.total || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium w-8">{item.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">{t('analytics.noDataAvailable')}</p>
                    )}
                </div>

                {/* Task Priority Breakdown */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">{t('analytics.tasksByPriority')}</h3>
                    {priorityChartData.length > 0 ? (
                        <div className="space-y-2">
                            {priorityChartData.map((item, index) => (
                                <div key={index} className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">{getTaskPriorityLabel(item.priority)}</span>
                                    <div className="flex items-center gap-2">
                                        <div className="w-32 bg-gray-200 rounded-full h-2">
                                            <div
                                                className="bg-green-600 h-2 rounded-full"
                                                style={{ width: `${(item.count / (taskStats?.total || 1)) * 100}%` }}
                                            ></div>
                                        </div>
                                        <span className="text-sm font-medium w-8">{item.count}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">{t('analytics.noDataAvailable')}</p>
                    )}
                </div>

                {/* Task Completion Trend */}
                <div className="bg-white p-6 rounded-lg shadow lg:col-span-2">
                    <h3 className="text-lg font-semibold mb-4">{t('analytics.taskCompletionTrend')}</h3>
                    {completionTrend && completionTrend.length > 0 ? (
                        <div className="space-y-2">
                            {completionTrend.map((item, index) => (
                                <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                    <span className="text-sm text-gray-600">{new Date(item.date).toLocaleDateString()}</span>
                                    <span className="text-sm font-medium">{item.count} {t('analytics.tasks')}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-gray-500 text-center py-8">{t('analytics.noDataAvailable')}</p>
                    )}
                </div>
            </div>

            {/* Resource Allocation Stats */}
            {resourceStats && (
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">{t('analytics.resourceAllocationOverview')}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                            <p className="text-sm text-gray-500">{t('analytics.totalActiveAllocations')}</p>
                            <p className="text-2xl font-bold">{resourceStats.total_active_allocations}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('analytics.usersWithAllocations')}</p>
                            <p className="text-2xl font-bold">{resourceStats.users_with_allocations}</p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{t('analytics.totalAllocationPercentage')}</p>
                            <p className="text-2xl font-bold">{resourceStats.total_allocation_percentage.toFixed(1)}%</p>
                        </div>
                    </div>
                    {resourceStats.by_project && resourceStats.by_project.length > 0 && (
                        <div>
                            <h4 className="font-medium mb-2">{t('analytics.byProject')}</h4>
                            <div className="space-y-2">
                                {resourceStats.by_project.map((item, index) => (
                                    <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                                        <span>{item.project_name}</span>
                                        <span className="font-medium">{item.total_percentage.toFixed(1)}%</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
