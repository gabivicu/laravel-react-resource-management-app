import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';
import { projectService } from '@/services/projects';
import { taskService } from '@/services/tasks';
import StatCard from '@/components/dashboard/StatCard';
import ProgressBar from '@/components/dashboard/ProgressBar';
import MiniChart from '@/components/dashboard/MiniChart';
import RecentActivity from '@/components/dashboard/RecentActivity';

// SVG Icons
const ProjectIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
);

const TaskIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
);

const UserIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
);

const ResourceIcon = () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
);

export default function Dashboard() {
    const { data: dashboardStats, isLoading: statsLoading } = useQuery({
        queryKey: ['analytics', 'dashboard'],
        queryFn: () => analyticsService.getDashboardStats(),
    });

    const { data: projectStats, isLoading: projectStatsLoading } = useQuery({
        queryKey: ['analytics', 'projects'],
        queryFn: () => analyticsService.getProjectStats(),
    });

    const { data: taskStats, isLoading: taskStatsLoading } = useQuery({
        queryKey: ['analytics', 'tasks'],
        queryFn: () => analyticsService.getTaskStats(),
    });

    const { data: recentProjects } = useQuery({
        queryKey: ['projects', 'recent'],
        queryFn: () => projectService.getProjects({}, 5),
    });

    const { data: recentTasks } = useQuery({
        queryKey: ['tasks', 'recent'],
        queryFn: () => taskService.getTasks({}, 5),
    });

    const projectsCount = dashboardStats?.projects || 0;
    const tasksCount = dashboardStats?.tasks || 0;
    const usersCount = dashboardStats?.users || 0;
    const allocationsCount = dashboardStats?.active_allocations || 0;

    // Prepare chart data
    const projectStatusData = projectStats?.by_status
        ? Object.entries(projectStats.by_status).map(([label, value]) => ({
              label,
              value: value as number,
          }))
        : [];

    const taskStatusData = taskStats?.by_status
        ? Object.entries(taskStats.by_status).map(([label, value]) => ({
              label,
              value: value as number,
          }))
        : [];

    const taskPriorityData = taskStats?.by_priority
        ? Object.entries(taskStats.by_priority).map(([label, value]) => ({
              label,
              value: value as number,
          }))
        : [];

    // Calculate completion rate
    const completionRate = taskStats?.completion_rate || 0;
    const totalEstimated = taskStats?.total_estimated_hours || 0;
    const totalActual = taskStats?.total_actual_hours || 0;

    // Prepare recent items
    const recentProjectsList =
        recentProjects?.data.map((p) => ({
            id: p.id,
            title: p.name,
            type: 'project' as const,
            status: p.status,
            updatedAt: p.updated_at,
        })) || [];

    const recentTasksList =
        recentTasks?.data.map((t) => ({
            id: t.id,
            title: t.title,
            type: 'task' as const,
            status: t.status,
            priority: t.priority,
            updatedAt: t.updated_at,
        })) || [];

    if (statsLoading || projectStatsLoading || taskStatsLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-1">Welcome back! Here&apos;s what&apos;s happening.</p>
                </div>
                <Link
                    to="/projects/create"
                    className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                >
                    + New Project
                </Link>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Projects"
                    value={projectsCount}
                    icon={<ProjectIcon />}
                    color="blue"
                    link="/projects"
                />
                <StatCard
                    title="Tasks"
                    value={tasksCount}
                    icon={<TaskIcon />}
                    color="green"
                    link="/tasks"
                />
                <StatCard
                    title="Team Members"
                    value={usersCount}
                    icon={<UserIcon />}
                    color="purple"
                    link="/users"
                />
                <StatCard
                    title="Active Allocations"
                    value={allocationsCount}
                    icon={<ResourceIcon />}
                    color="orange"
                    link="/resource-allocations"
                />
            </div>

            {/* Charts and Progress Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Task Status Chart */}
                {taskStatusData.length > 0 && (
                    <MiniChart data={taskStatusData} title="Tasks by Status" />
                )}

                {/* Task Priority Chart */}
                {taskPriorityData.length > 0 && (
                    <MiniChart data={taskPriorityData} title="Tasks by Priority" />
                )}

                {/* Project Status Chart */}
                {projectStatusData.length > 0 && (
                    <MiniChart data={projectStatusData} title="Projects by Status" />
                )}
            </div>

            {/* Progress and Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Task Completion Progress */}
                <div className="lg:col-span-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 border border-gray-100 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Task Progress</h3>
                    <div className="space-y-4">
                        <ProgressBar
                            label="Completion Rate"
                            value={completionRate}
                            max={100}
                            color="green"
                        />
                        <div className="pt-4 border-t border-gray-100 dark:border-gray-700 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Estimated Hours</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {totalEstimated.toFixed(1)}h
                                </span>
                            </div>
                            <div className="flex justify-between text-sm">
                                <span className="text-gray-600 dark:text-gray-400">Actual Hours</span>
                                <span className="font-medium text-gray-900 dark:text-white">
                                    {totalActual.toFixed(1)}h
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Recent Projects */}
                <RecentActivity items={recentProjectsList} type="projects" />

                {/* Recent Tasks */}
                <RecentActivity items={recentTasksList} type="tasks" />
            </div>
        </div>
    );
}
