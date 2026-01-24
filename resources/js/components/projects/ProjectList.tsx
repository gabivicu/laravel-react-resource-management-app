import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { projectService, ProjectListResponse } from '@/services/projects';
import { useState, useEffect, useRef } from 'react';
import Modal from '@/components/ui/Modal';
import ProjectForm from './ProjectForm';
import ProjectDetailsModal from './ProjectDetailsModal';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import useDebounce from '@/hooks/useDebounce';

const statusColors = {
    planning: 'bg-gray-100 text-gray-800',
    active: 'bg-green-100 text-green-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    cancelled: 'bg-red-100 text-red-800',
};

export default function ProjectList() {
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [keyboardIndex, setKeyboardIndex] = useState(-1);
    
    const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
    const [viewingProjectId, setViewingProjectId] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    
    const searchContainerRef = useRef<HTMLDivElement>(null);
    const suggestionsListRef = useRef<HTMLUListElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const queryClient = useQueryClient();

    // Fetch suggestions
    const { data: suggestionsData } = useQuery({
        queryKey: ['projects-suggestions', debouncedSearch],
        queryFn: () => projectService.getProjects({ search: debouncedSearch }, 1, 5),
        enabled: debouncedSearch.length > 1 && showSuggestions,
    });

    const suggestions = suggestionsData?.data || [];

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<ProjectListResponse>({
        queryKey: ['projects', statusFilter, debouncedSearch],
        queryFn: ({ pageParam }) => projectService.getProjects(
            {
                ...(statusFilter ? { status: statusFilter as any } : {}),
                ...(debouncedSearch ? { search: debouncedSearch } : {}),
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

    // Reset keyboard index when suggestions change
    useEffect(() => {
        setKeyboardIndex(-1);
    }, [suggestions]);

    // Close suggestions on click outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
                setKeyboardIndex(-1);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Scroll to highlighted item
    const scrollToIndex = (index: number) => {
        if (suggestionsListRef.current && index >= 0) {
            const items = suggestionsListRef.current.querySelectorAll('li');
            const item = items[index];
            if (item) {
                item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
            }
        }
    };

    // Handle keyboard navigation
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!showSuggestions || suggestions.length === 0) {
            if (e.key === 'ArrowDown' && debouncedSearch.length > 1) {
                setShowSuggestions(true);
            }
            return;
        }

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setKeyboardIndex((prev) => {
                    const nextIndex = prev < suggestions.length - 1 ? prev + 1 : prev;
                    scrollToIndex(nextIndex);
                    return nextIndex;
                });
                break;
            case 'ArrowUp':
                e.preventDefault();
                setKeyboardIndex((prev) => {
                    const nextIndex = prev > 0 ? prev - 1 : -1;
                    scrollToIndex(nextIndex);
                    return nextIndex;
                });
                break;
            case 'Enter':
                e.preventDefault();
                if (keyboardIndex >= 0 && keyboardIndex < suggestions.length) {
                    const selectedProject = suggestions[keyboardIndex];
                    setSearchQuery(selectedProject.name);
                    setShowSuggestions(false);
                    setKeyboardIndex(-1);
                }
                break;
            case 'Escape':
                e.preventDefault();
                setShowSuggestions(false);
                setKeyboardIndex(-1);
                searchInputRef.current?.blur();
                break;
        }
    };

    useEffect(() => {
        if (isLoadMoreVisible && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isLoadMoreVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

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

    const openViewModal = (projectId: number) => {
        setViewingProjectId(projectId);
        setIsViewModalOpen(true);
    };

    const closeModals = () => {
        setIsCreateModalOpen(false);
        setIsEditModalOpen(false);
        setIsViewModalOpen(false);
        setTimeout(() => {
            setEditingProjectId(null);
            setViewingProjectId(null);
        }, 300);
    };

    const projects = data?.pages.flatMap((page) => page.data) || [];

    return (
        <div className="w-full">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-gray-900">Projects</h2>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="px-6 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm hover:shadow-md w-full sm:w-auto"
                >
                    + New Project
                </button>
            </div>

            {/* Filters & Search */}
            <div className="mb-6 flex flex-col sm:flex-row gap-4">
                {/* Search Bar */}
                <div className="relative flex-1" ref={searchContainerRef}>
                    <div className="relative">
                        <input
                            ref={searchInputRef}
                            type="text"
                            placeholder="Search projects..."
                            value={searchQuery}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setShowSuggestions(true);
                                setKeyboardIndex(-1);
                            }}
                            onKeyDown={handleSearchKeyDown}
                            onFocus={() => setShowSuggestions(true)}
                            className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                        <svg
                            className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                            />
                        </svg>
                        {searchQuery && (
                            <button
                                onClick={() => {
                                    setSearchQuery('');
                                    setShowSuggestions(false);
                                    setKeyboardIndex(-1);
                                }}
                                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        )}
                    </div>

                    {/* Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                            <ul ref={suggestionsListRef}>
                                {suggestions.map((project, index) => (
                                    <li
                                        key={project.id}
                                        onClick={() => {
                                            setSearchQuery(project.name);
                                            setShowSuggestions(false);
                                            setKeyboardIndex(-1);
                                        }}
                                        className={`px-4 py-2 cursor-pointer text-sm text-gray-700 flex justify-between items-center ${
                                            index === keyboardIndex 
                                                ? 'bg-blue-50 border-l-2 border-blue-500' 
                                                : 'hover:bg-gray-50'
                                        }`}
                                    >
                                        <span>{project.name}</span>
                                        <span className={`text-xs px-2 py-0.5 rounded ${statusColors[project.status]}`}>
                                            {project.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Status Filter */}
                <div className="w-full sm:w-48">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="">All Statuses</option>
                        <option value="planning">Planning</option>
                        <option value="active">Active</option>
                        <option value="on_hold">On Hold</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {/* Projects Grid */}
            {isLoading ? (
                <div className="flex items-center justify-center p-8">
                    <div className="text-gray-500">Loading projects...</div>
                </div>
            ) : isError ? (
                <div className="p-4 bg-red-50 text-red-600 rounded">
                    Error loading projects. Please try again.
                </div>
            ) : projects.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p className="mb-4">No projects found matching your criteria.</p>
                    {searchQuery || statusFilter ? (
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setStatusFilter('');
                            }}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            Clear filters
                        </button>
                    ) : (
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="text-blue-600 hover:text-blue-700"
                        >
                            Create your first project
                        </button>
                    )}
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {projects.map((project) => (
                            <div
                                key={project.id}
                                className="bg-white p-6 rounded-lg shadow hover:shadow-lg transition-shadow flex flex-col h-full"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900 line-clamp-1" title={project.name}>
                                        {project.name}
                                    </h3>
                                    <span
                                        className={`px-2 py-1 text-xs rounded whitespace-nowrap ml-2 ${
                                            statusColors[project.status]
                                        }`}
                                    >
                                        {project.status.replace('_', ' ')}
                                    </span>
                                </div>

                                {project.description && (
                                    <p className="text-sm text-gray-600 mb-4 line-clamp-2 flex-grow">
                                        {project.description}
                                    </p>
                                )}

                                <div className="flex gap-2 text-sm text-gray-500 mb-4">
                                    {project.start_date && (
                                        <span>Start: {new Date(project.start_date).toLocaleDateString()}</span>
                                    )}
                                </div>

                                {project.budget && (
                                    <div className="text-sm font-medium mb-4">
                                        Budget: ${project.budget.toLocaleString()}
                                    </div>
                                )}

                                <div className="flex gap-2 mt-auto">
                                    <button
                                        onClick={() => openViewModal(project.id)}
                                        className="flex-1 px-3 py-2 bg-blue-50 text-blue-600 rounded text-center hover:bg-blue-100 transition-colors"
                                    >
                                        View
                                    </button>
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
                    
                    {/* Infinite Scroll Sensor */}
                    <div ref={loadMoreRef} className="py-8 flex justify-center">
                        {isFetchingNextPage ? (
                            <div className="text-gray-500 animate-pulse">Loading more projects...</div>
                        ) : hasNextPage ? (
                            <div className="text-gray-400 text-sm">Scroll to load more</div>
                        ) : (
                            projects.length > 0 && <div className="text-gray-400 text-sm">No more projects to load</div>
                        )}
                    </div>
                </>
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

            {/* View Project Modal */}
            <ProjectDetailsModal
                projectId={viewingProjectId || 0}
                isOpen={isViewModalOpen}
                onClose={closeModals}
            />
        </div>
    );
}
