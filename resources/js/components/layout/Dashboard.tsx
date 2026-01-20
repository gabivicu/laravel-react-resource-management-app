import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';

export default function Dashboard() {
    const { data: dashboardStats } = useQuery({
        queryKey: ['analytics', 'dashboard'],
        queryFn: () => analyticsService.getDashboardStats(),
    });

    const projectsCount = dashboardStats?.projects || 0;
    const tasksCount = dashboardStats?.tasks || 0;
    const usersCount = dashboardStats?.users || 0;
    const allocationsCount = dashboardStats?.active_allocations || 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Dashboard</h2>
                <Link
                    to="/projects/create"
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                >
                    + New Project
                </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
                <Link
                    to="/projects"
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow block"
                >
                    <h3 className="text-lg font-semibold mb-2">Projects</h3>
                    <p className="text-3xl font-bold">{projectsCount}</p>
                </Link>
                <Link
                    to="/tasks"
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow block"
                >
                    <h3 className="text-lg font-semibold mb-2">Tasks</h3>
                    <p className="text-3xl font-bold">{tasksCount}</p>
                </Link>
                <Link
                    to="/resource-allocations"
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow block"
                >
                    <h3 className="text-lg font-semibold mb-2">Active Allocations</h3>
                    <p className="text-3xl font-bold">{allocationsCount}</p>
                </Link>
                <Link
                    to="/users"
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow block"
                >
                    <h3 className="text-lg font-semibold mb-2">Users</h3>
                    <p className="text-3xl font-bold">{usersCount}</p>
                </Link>
                <Link
                    to="/analytics"
                    className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow block"
                >
                    <h3 className="text-lg font-semibold mb-2">Analytics</h3>
                    <p className="text-sm text-gray-500">View Reports</p>
                </Link>
            </div>
        </div>
    );
}
