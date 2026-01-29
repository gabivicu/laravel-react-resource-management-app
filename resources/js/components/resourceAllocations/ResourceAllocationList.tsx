import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { resourceAllocationService } from '@/services/resourceAllocations';
import { projectService } from '@/services/projects';
import { useState } from 'react';
import Modal from '@/components/ui/Modal';
import ResourceAllocationForm from './ResourceAllocationForm';
import {
    Box,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    LinearProgress,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    IconButton,
    Tooltip,
    Card,
    CardContent,
    CircularProgress,
    useMediaQuery,
    useTheme,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { PageHeader, EmptyState, ConfirmDialog } from '@/components/ui';

export default function ResourceAllocationList() {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [projectFilter, setProjectFilter] = useState<string>('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [editingAllocationId, setEditingAllocationId] = useState<number | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [deletingAllocationId, setDeletingAllocationId] = useState<number | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
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
            setIsDeleteDialogOpen(false);
            setDeletingAllocationId(null);
        },
    });

    const allocations = data?.data || [];
    const projects = projectsData?.data || [];

    const openEditModal = (allocationId: number) => {
        setEditingAllocationId(allocationId);
        setIsEditModalOpen(true);
    };

    const openDeleteDialog = (allocationId: number) => {
        setDeletingAllocationId(allocationId);
        setIsDeleteDialogOpen(true);
    };

    const handleDelete = () => {
        if (deletingAllocationId) {
            deleteMutation.mutate(deletingAllocationId);
        }
    };

    return (
        <Box>
            <PageHeader
                title={t('resourceAllocations.title')}
                action={{
                    label: t('resourceAllocations.newAllocation'),
                    onClick: () => setIsCreateModalOpen(true),
                    icon: <AddIcon />,
                }}
            />

            {/* Filters */}
            <Box sx={{ mb: 3 }}>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>{t('resourceAllocations.allProjects')}</InputLabel>
                    <Select
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        label={t('resourceAllocations.allProjects')}
                    >
                        <MenuItem value="">{t('resourceAllocations.allProjects')}</MenuItem>
                        {projects.map((project) => (
                            <MenuItem key={project.id} value={project.id}>
                                {project.name}
                            </MenuItem>
                        ))}
                    </Select>
                </FormControl>
            </Box>

            {/* Allocations Table */}
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <EmptyState
                    type="error"
                    title={t('resourceAllocations.errorLoadingAllocations')}
                />
            ) : allocations.length === 0 ? (
                <EmptyState
                    type="tasks"
                    title={t('resourceAllocations.noAllocationsFound')}
                    action={{
                        label: t('resourceAllocations.createFirstAllocation'),
                        onClick: () => setIsCreateModalOpen(true),
                    }}
                />
            ) : !isMobile ? (
                <TableContainer component={Paper} sx={{ mb: 2 }}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>{t('resourceAllocations.userLabel')}</TableCell>
                                <TableCell>{t('resourceAllocations.projectLabel')}</TableCell>
                                <TableCell>{t('resourceAllocations.allocation')}</TableCell>
                                <TableCell>{t('resourceAllocations.roleLabel')}</TableCell>
                                <TableCell>{t('resourceAllocations.period')}</TableCell>
                                <TableCell align="right">{t('common.actions')}</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {allocations.map((allocation) => (
                                <TableRow
                                    key={allocation.id}
                                    sx={{
                                        '&:hover': {
                                            backgroundColor: (theme) =>
                                                alpha(theme.palette.primary.main, 0.04),
                                        },
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>
                                            {allocation.user?.name || 'N/A'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary">
                                            {allocation.user?.email || ''}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {allocation.project?.name || 'N/A'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    width: 100,
                                                    height: 8,
                                                    borderRadius: 1,
                                                    backgroundColor: (theme) =>
                                                        alpha(theme.palette.primary.main, 0.2),
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Number(allocation.allocation_percentage) || 0}
                                                    sx={{
                                                        height: '100%',
                                                        backgroundColor: 'transparent',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: 'primary.main',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                {allocation.allocation_percentage}%
                                            </Typography>
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {allocation.role || '-'}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {new Date(allocation.start_date).toLocaleDateString()}
                                        </Typography>
                                        {allocation.end_date && (
                                            <Typography variant="caption" color="text.secondary">
                                                to {new Date(allocation.end_date).toLocaleDateString()}
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                            <Tooltip title={t('common.edit')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openEditModal(allocation.id)}
                                                    sx={{
                                                        color: 'primary.main',
                                                        '&:hover': {
                                                            backgroundColor: (theme) =>
                                                                alpha(theme.palette.primary.main, 0.1),
                                                        },
                                                    }}
                                                >
                                                    <EditIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title={t('common.delete')}>
                                                <IconButton
                                                    size="small"
                                                    onClick={() => openDeleteDialog(allocation.id)}
                                                    sx={{
                                                        color: 'error.main',
                                                        '&:hover': {
                                                            backgroundColor: (theme) =>
                                                                alpha(theme.palette.error.main, 0.1),
                                                        },
                                                    }}
                                                >
                                                    <DeleteIcon fontSize="small" />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
            ) : (

                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {allocations.map((allocation) => (
                        <Card key={allocation.id} elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                    <Box sx={{ flex: 1, minWidth: 0 }}>
                                        <Typography variant="subtitle2" fontWeight={600} noWrap>
                                            {allocation.user?.name || 'N/A'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" noWrap>
                                            {allocation.user?.email || ''}
                                        </Typography>
                                    </Box>
                                    <Box sx={{ display: 'flex', gap: 1, ml: 1 }}>
                                        <IconButton
                                            size="small"
                                            onClick={() => openEditModal(allocation.id)}
                                            sx={{ color: 'primary.main' }}
                                        >
                                            <EditIcon fontSize="small" />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            onClick={() => openDeleteDialog(allocation.id)}
                                            sx={{ color: 'error.main' }}
                                        >
                                            <DeleteIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                </Box>

                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                                    <Box>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                                            {t('resourceAllocations.projectLabel')}:{' '}
                                        </Typography>
                                        <Typography variant="body2" component="span">
                                            {allocation.project?.name || 'N/A'}
                                        </Typography>
                                    </Box>

                                    <Box>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary" display="block" sx={{ mb: 0.5 }}>
                                            {t('resourceAllocations.allocation')}:
                                        </Typography>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    height: 8,
                                                    borderRadius: 1,
                                                    backgroundColor: (theme) =>
                                                        alpha(theme.palette.primary.main, 0.2),
                                                    overflow: 'hidden',
                                                }}
                                            >
                                                <LinearProgress
                                                    variant="determinate"
                                                    value={Number(allocation.allocation_percentage) || 0}
                                                    sx={{
                                                        height: '100%',
                                                        backgroundColor: 'transparent',
                                                        '& .MuiLinearProgress-bar': {
                                                            backgroundColor: 'primary.main',
                                                        },
                                                    }}
                                                />
                                            </Box>
                                            <Typography variant="body2" fontWeight={600}>
                                                {allocation.allocation_percentage}%
                                            </Typography>
                                        </Box>
                                    </Box>

                                    {allocation.role && (
                                        <Box>
                                            <Typography variant="caption" fontWeight={600} color="text.secondary">
                                                {t('resourceAllocations.roleLabel')}:{' '}
                                            </Typography>
                                            <Typography variant="body2" component="span">
                                                {allocation.role}
                                            </Typography>
                                        </Box>
                                    )}

                                    <Box>
                                        <Typography variant="caption" fontWeight={600} color="text.secondary">
                                            {t('resourceAllocations.period')}:{' '}
                                        </Typography>
                                        <Typography variant="body2" component="span">
                                            {new Date(allocation.start_date).toLocaleDateString()}
                                            {allocation.end_date &&
                                                ` - ${new Date(allocation.end_date).toLocaleDateString()}`}
                                        </Typography>
                                    </Box>
                                </Box>
                            </CardContent>
                        </Card>
                    ))}
                </Box>
            )}

            {/* Delete Confirmation Dialog */}
            <ConfirmDialog
                open={isDeleteDialogOpen}
                onClose={() => {
                    setIsDeleteDialogOpen(false);
                    setDeletingAllocationId(null);
                }}
                onConfirm={handleDelete}
                title={t('common.delete')}
                message={t('common.confirmDelete')}
                confirmLabel={t('common.delete')}
                variant="danger"
                loading={deleteMutation.isPending}
            />

            {/* Create Modal */}
            <Modal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                title={t('resourceAllocations.createAllocation')}
            >
                <ResourceAllocationForm
                    onSuccess={() => setIsCreateModalOpen(false)}
                    onCancel={() => setIsCreateModalOpen(false)}
                />
            </Modal>

            {/* Edit Modal */}
            <Modal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setEditingAllocationId(null);
                }}
                title={t('resourceAllocations.editAllocation')}
            >
                {editingAllocationId && (
                    <ResourceAllocationForm
                        allocationId={editingAllocationId}
                        onSuccess={() => {
                            setIsEditModalOpen(false);
                            setEditingAllocationId(null);
                        }}
                        onCancel={() => {
                            setIsEditModalOpen(false);
                            setEditingAllocationId(null);
                        }}
                    />
                )}
            </Modal>
        </Box>
    );
}
