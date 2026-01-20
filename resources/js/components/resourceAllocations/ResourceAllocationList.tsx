import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { resourceAllocationService } from '@/services/resourceAllocations';
import { projectService } from '@/services/projects';
import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function ResourceAllocationList() {
    const [projectFilter, setProjectFilter] = useState<string>('');
    const queryClient = useQueryClient();

    const { data: projectsData } = useQuery({
        queryKey: ['projects', 'select'],
        queryFn: () => projectService.getProjects({}, 100),
    });

    const { data, isLoading, error } = useQuery({
        queryKey: ['resource-allocations', projectFilter],
        queryFn: () => resourceAllocationService.getAllocations(
            projectFilter ? { project_id: parseInt(projectFilter) } : {}
        ),
    });

    const deleteMutation = useMutation({
        mutationFn: resourceAllocationService.deleteAllocation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-allocations'] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">Loading allocations...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded">
                Error loading allocations. Please try again.
            </div>
        );
    }

    const allocations = data?.data || [];
    const projects = projectsData?.data || [];

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Resource Allocations</h2>
                <Link
                    to="/resource-allocations/create"
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                >
                    + New Allocation
                </Link>
            </div>

            {/* Filters */}
            <div className="mb-4">
                <select
                    value={projectFilter}
                    onChange={(e) => setProjectFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                >
                    <option value="">All Projects</option>
                    {projects.map((project) => (
                        <option key={project.id} value={project.id}>
                            {project.name}
                        </option>
                    ))}
                </select>
            </div>

            {/* Allocations Table */}
            {allocations.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="mb-4">No allocations found.</p>
                    <Link
                        to="/resource-allocations/create"
                        className="text-blue-600 hover:text-blue-700"
                    >
                        Create your first allocation
                    </Link>
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Project</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Allocation</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {allocations.map((allocation) => (
                                <tr key={allocation.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {allocation.user?.name || 'N/A'}
                                        </div>
                                        <div className="text-sm text-gray-500">
                                            {allocation.user?.email || ''}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {allocation.project?.name || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                                                <div
                                                    className="bg-blue-600 h-2 rounded-full"
                                                    style={{ width: `${allocation.allocation_percentage}%` }}
                                                ></div>
                                            </div>
                                            <span className="text-sm font-medium">
                                                {allocation.allocation_percentage}%
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        {allocation.role || '-'}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-600">
                                        <div>
                                            {new Date(allocation.start_date).toLocaleDateString()}
                                        </div>
                                        {allocation.end_date && (
                                            <div className="text-xs text-gray-500">
                                                to {new Date(allocation.end_date).toLocaleDateString()}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-sm">
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/resource-allocations/${allocation.id}/edit`}
                                                className="text-blue-600 hover:text-blue-800"
                                            >
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => {
                                                    if (confirm('Are you sure you want to delete this allocation?')) {
                                                        deleteMutation.mutate(allocation.id);
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
            )}
        </div>
    );
}
