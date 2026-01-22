import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectService } from '@/services/projects';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import Modal from '@/components/ui/Modal';
import ProjectForm from './ProjectForm';

const statusColors = {
    planning: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function ProjectList() {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['projects', statusFilter],
        queryFn: () => projectService.getProjects(
            statusFilter ? { status: statusFilter as any } : {}
        ),
    });

    const deleteMutation = useMutation({
        mutationFn: projectService.deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
        },
    });

    const openEditModal = (projectId: number) => {
        setEditingProjectId(projectId);
        setIsEditModalOpen(true);
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        // Delay clearing the editingProjectId to allow the exit animation to complete
        setTimeout(() => {
            setEditingProjectId(null);
        }, 300);
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">Loading projects...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-4 bg-red-50 text-red-600 rounded">
                Error loading projects. Please try again.
            </div>
        );
    }

    const projects = data?.data || [];

    return (
        <div className="w-full">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md"
                >
                    + New Project
                </button>
            </div>

            {/* Filters */}
            <div className="mb-4 flex gap-2">
                <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg"
                >
                    <option value="">All Statuses</option>
                    <option value="planning">Planning</option>
                    <option value="active">Active</option>
                    <option value="on_hold">On Hold</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                </select>
            </div>

            {/* Projects Grid */}
            {projects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="mb-4">No projects found.</p>
                    <button
                        onClick={() => setIsCreateModalOpen(true)}
                        className="text-blue-600 hover:text-blue-700"
                    >
                        Create your first project
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {projects.map((project) => (
                        <div
                            key={project.id}
                            className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold">{project.name}</h3>
                                <span
                                    className={`px-2 py-1 text-xs rounded ${
                                        statusColors[project.status]
                                    }`}
                                >
                                    {project.status}
                                </span>
                            </div>

                            {project.description && (
                                <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                    {project.description}
                                </p>
                            )}

                            <div className="flex gap-2 text-sm text-gray-500 mb-4">
                                {project.start_date && (
                                    <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                                )}
                                {project.end_date && (
                                    <span>End: {new Date(project.end_date).toLocaleDateString()}</span>
                                )}
                            </div>

                            {project.budget && (
                                <div className="text-sm font-medium mb-4">
                                    Budget: ${project.budget.toLocaleString()}
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Link
                                    to={`/projects/${project.id}`}
                                    className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded text-center hover:bg-blue-100 transition-colors"
                                >
                                    View
                                </Link>
                                <button
                                    onClick={() => openEditModal(project.id)}
                                    className="flex-1 px-3 py-2 bg-gray-50 text-gray-700 rounded text-center hover:bg-gray-100 transition-colors"
                                >
                                    Edit
                                </button>
                                <button
                                    onClick={() => {
                                        if (confirm('Are you sure you want to delete this project?')) {
                                            deleteMutation.mutate(project.id);
                                        }
                                    }}
                                    className="px-3 py-2 bg-red-50 text-red-600 rounded hover:bg-red-100 transition-colors"
                                    disabled={deleteMutation.isPending}
                                >
                                    {deleteMutation.isPending ? '...' : 'Delete'}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Project Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={closeModals}
                title="Create New Project"
            >
                <ProjectForm
                    onSuccess={closeModals}
                    onCancel={closeModals}
                />
            </Modal>

            {/* Edit Project Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={closeModals}
                title="Edit Project"
            >
                {editingProjectId && (
                    <ProjectForm
                        projectId={editingProjectId}
                        onSuccess={closeModals}
                        onCancel={closeModals}
                    />
                )}
            </Modal>
        </div>
    );
}
