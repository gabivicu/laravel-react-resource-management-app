import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { projectService, ProjectListResponse } from '@/services/projects';
import { useState, useEffect, useMemo } from 'react';
import {
    Box,
    Card,
    CardContent,
    Typography,
    Button,
    IconButton,
    Grid,
    MenuItem,
    Select,
    FormControl,
    InputLabel,
    Tooltip,
    Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    CalendarToday as CalendarIcon,
    AttachMoney as BudgetIcon,
} from '@mui/icons-material';
import Modal from '@/components/ui/Modal';
import ProjectForm from './ProjectForm';
import ProjectDetailsModal from './ProjectDetailsModal';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
import useDebounce from '@/hooks/useDebounce';
import { PageHeader, StatusChip, EmptyState, SearchInput, ConfirmDialog } from '@/components/ui';

export default function ProjectList() {
    const { t } = useTranslation();
    const [statusFilter, setStatusFilter] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearch = useDebounce(searchQuery, 300);
    
    const [editingProjectId, setEditingProjectId] = useState<number | null>(null);
    const [viewingProjectId, setViewingProjectId] = useState<number | null>(null);
    const [deletingProjectId, setDeletingProjectId] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    
    const queryClient = useQueryClient();

    // Fetch suggestions
    const { data: suggestionsData } = useQuery({
        queryKey: ['projects-suggestions', debouncedSearch],
        queryFn: () => projectService.getProjects({ search: debouncedSearch }, 1, 5),
        enabled: debouncedSearch.length > 1,
    });

    const suggestions = useMemo(
        () =>
            suggestionsData?.data.map((p) => ({
                id: p.id,
                label: p.name,
                secondary: p.status,
            })) || [],
        [suggestionsData?.data]
    );

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
        isError,
    } = useInfiniteQuery<ProjectListResponse>({
        queryKey: ['projects', statusFilter, debouncedSearch],
        queryFn: ({ pageParam }) =>
            projectService.getProjects(
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

    useEffect(() => {
        if (isLoadMoreVisible && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isLoadMoreVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const deleteMutation = useMutation({
        mutationFn: projectService.deleteProject,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['projects'] });
            setIsDeleteDialogOpen(false);
            setDeletingProjectId(null);
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

    const openDeleteDialog = (projectId: number) => {
        setDeletingProjectId(projectId);
        setIsDeleteDialogOpen(true);
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
        <Box>
            <PageHeader
                title={t('projects.title')}
                subtitle={`${projects.length} projects`}
                action={{
                    label: t('projects.newProject'),
                    onClick: () => setIsCreateModalOpen(true),
                    icon: <AddIcon />,
                }}
            />

            {/* Filters */}
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    gap: 2,
                    mb: 4,
                }}
            >
                <Box sx={{ flex: 1 }}>
                    <SearchInput
                        value={searchQuery}
                        onChange={setSearchQuery}
                        placeholder={t('projects.searchProjects')}
                        suggestions={suggestions}
                        onSelect={(item) => setSearchQuery(item.label)}
                    />
                </Box>
                <FormControl sx={{ minWidth: { xs: '100%', sm: 200 } }} size="small">
                    <InputLabel>{t('projects.allStatuses')}</InputLabel>
                    <Select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        label={t('projects.allStatuses')}
                    >
                        <MenuItem value="">{t('projects.allStatuses')}</MenuItem>
                        <MenuItem value="planning">{t('projects.statusPlanning')}</MenuItem>
                        <MenuItem value="active">{t('projects.statusActive')}</MenuItem>
                        <MenuItem value="on_hold">{t('projects.statusOnHold')}</MenuItem>
                        <MenuItem value="completed">{t('projects.statusCompleted')}</MenuItem>
                        <MenuItem value="cancelled">{t('projects.statusCancelled')}</MenuItem>
                    </Select>
                </FormControl>
            </Box>

            {/* Projects Grid */}
            {isLoading ? (
                <Grid container spacing={3} data-testid="loading-skeletons">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <Grid size={{ xs: 12, md: 6, lg: 4 }} key={i}>
                            <Card>
                                <CardContent>
                                    <Skeleton variant="text" width="70%" height={28} />
                                    <Skeleton variant="rounded" width={80} height={24} sx={{ my: 1 }} />
                                    <Skeleton variant="text" width="90%" />
                                    <Skeleton variant="text" width="60%" />
                                    <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                                        <Skeleton variant="rounded" width="100%" height={36} />
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            ) : isError ? (
                <EmptyState
                    type="error"
                    title={t('common.error')}
                    description="Failed to load projects. Please try again."
                    action={{
                        label: 'Retry',
                        onClick: () => queryClient.invalidateQueries({ queryKey: ['projects'] }),
                    }}
                />
            ) : projects.length === 0 ? (
                <EmptyState
                    type="projects"
                    action={
                        searchQuery || statusFilter
                            ? {
                                  label: t('common.clear') || 'Clear filters',
                                  onClick: () => {
                                      setSearchQuery('');
                                      setStatusFilter('');
                                  },
                              }
                            : {
                                  label: t('projects.createFirstProject') || 'Create first project',
                                  onClick: () => setIsCreateModalOpen(true),
                              }
                    }
                />
            ) : (
                <>
                    <Grid container spacing={3}>
                        {projects.map((project, index) => (
                            <Grid 
                                size={{ xs: 12, md: 6, lg: 4 }} 
                                key={project.id}
                                sx={{
                                    animation: 'fadeInUp 0.4s ease-out',
                                    animationDelay: `${(index % 6) * 50}ms`,
                                    animationFillMode: 'backwards',
                                }}
                            >
                                <Card
                                    sx={{
                                        height: '100%',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        transition: 'all 0.3s ease',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: (theme) => theme.shadows[8],
                                        },
                                    }}
                                >
                                    <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                        {/* Header */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'flex-start',
                                                mb: 2,
                                            }}
                                        >
                                            <Typography
                                                variant="h6"
                                                fontWeight={600}
                                                sx={{
                                                    flex: 1,
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    mr: 1,
                                                }}
                                                title={project.name}
                                            >
                                                {project.name}
                                            </Typography>
                                            <StatusChip status={project.status} />
                                        </Box>

                                        {/* Description */}
                                        {project.description && (
                                            <Typography
                                                variant="body2"
                                                color="text.secondary"
                                                sx={{
                                                    mb: 2,
                                                    flex: 1,
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                {project.description}
                                            </Typography>
                                        )}

                                        {/* Meta Info */}
                                        <Box sx={{ mb: 2 }}>
                                            {project.start_date && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        color: 'text.secondary',
                                                        mb: 0.5,
                                                    }}
                                                >
                                                    <CalendarIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="body2">
                                                        {new Date(project.start_date).toLocaleDateString()}
                                                    </Typography>
                                                </Box>
                                            )}
                                            {project.budget && (
                                                <Box
                                                    sx={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 1,
                                                        color: 'success.main',
                                                    }}
                                                >
                                                    <BudgetIcon sx={{ fontSize: 16 }} />
                                                    <Typography variant="body2" fontWeight={600}>
                                                        ${project.budget.toLocaleString()}
                                                    </Typography>
                                                </Box>
                                            )}
                                        </Box>

                                        {/* Actions */}
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                gap: 1,
                                                mt: 'auto',
                                                pt: 2,
                                                borderTop: 1,
                                                borderColor: 'divider',
                                            }}
                                        >
                                            <Button
                                                variant="contained"
                                                size="small"
                                                startIcon={<ViewIcon />}
                                                onClick={() => openViewModal(project.id)}
                                                sx={{ flex: 1 }}
                                            >
                                                View
                                            </Button>
                                            <Tooltip title={t('common.edit')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openEditModal(project.id)}
                                                    sx={{
                                                        backgroundColor: (theme) =>
                                                            alpha(theme.palette.info.main, 0.1),
                                                        color: 'info.main',
                                                        '&:hover': {
                                                            backgroundColor: (theme) =>
                                                                alpha(theme.palette.info.main, 0.2),
                                                        },
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('common.delete')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openDeleteDialog(project.id)}
                                                    sx={{
                                                        backgroundColor: (theme) =>
                                                            alpha(theme.palette.error.main, 0.1),
                                                        color: 'error.main',
                                                        '&:hover': {
                                                            backgroundColor: (theme) =>
                                                                alpha(theme.palette.error.main, 0.2),
                                                        },
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>

                    {/* Infinite Scroll Sensor */}
                    <Box ref={loadMoreRef} sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                        {isFetchingNextPage ? (
                            <Typography color="text.secondary">{t('common.loading')}</Typography>
                        ) : hasNextPage ? (
                            <Typography variant="body2" color="text.secondary">
                                {t('common.scrollToLoadMore')}
                            </Typography>
                        ) : (
                            projects.length > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    {t('projects.noMoreProjects')}
                                </Typography>
                            )
                        )}
                    </Box>
                </>
            )}

            {/* Create Project Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={closeModals}
                title={t('projects.createProject')}
            >
                <ProjectForm onSuccess={closeModals} onCancel={closeModals} />
            </Modal>

            {/* Edit Project Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={closeModals}
                title={t('projects.editProject')}
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

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => setIsDeleteDialogOpen(false)}
                onConfirm={() => deletingProjectId && deleteMutation.mutate(deletingProjectId)}
                title="Delete Project"
                message="Are you sure you want to delete this project? This action cannot be undone."
                confirmLabel="Delete"
                variant="danger"
                loading={deleteMutation.isPending}
            />
        </Box>
    );
}
