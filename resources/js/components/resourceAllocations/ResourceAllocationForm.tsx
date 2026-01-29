import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { resourceAllocationService } from '@/services/resourceAllocations';
import { userService } from '@/services/users';
import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { ResourceAllocation } from '@/types';
import ProjectSelector from '@/components/projects/ProjectSelector';
import {
    Box,
    TextField,
    MenuItem,
    Button,
    Grid,
    CircularProgress,
} from '@mui/material';
import DatePicker from '@/components/ui/DatePicker';

interface ResourceAllocationFormData {
    project_id: string;
    user_id: string;
    role: string;
    allocation_percentage: string;
    start_date: string;
    end_date: string;
    notes: string;
}

interface ResourceAllocationFormProps {
    allocationId?: number;
    initialProjectId?: number;
    onSuccess?: () => void;
    onCancel?: () => void;
}

export default function ResourceAllocationForm({ 
    allocationId, 
    initialProjectId, 
    onSuccess, 
    onCancel 
}: ResourceAllocationFormProps = {}) {
    const { t } = useTranslation();
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const isEdit = !!allocationId || !!id;
    const editId = allocationId || (id ? Number(id) : undefined);

    const [formData, setFormData] = useState<ResourceAllocationFormData>({
        project_id: initialProjectId ? initialProjectId.toString() : '',
        user_id: '',
        role: '',
        allocation_percentage: '',
        start_date: '',
        end_date: '',
        notes: '',
    });

    const [errors, setErrors] = useState<Record<string, string[]>>({});

    const { data: usersData } = useQuery({
        queryKey: ['users', 'select'],
        queryFn: () => userService.getUsers({}, 100),
    });

    const { data: allocation, isLoading } = useQuery({
        queryKey: ['resource-allocation', editId],
        queryFn: () => resourceAllocationService.getAllocation(editId!),
        enabled: isEdit && !!editId,
    });

    const users = useMemo(() => usersData?.data || [], [usersData?.data]);

    useEffect(() => {
        if (allocation && isEdit) {
            const userIdStr = allocation.user_id.toString();
            // Check if user_id exists in the users list (if users are available)
            // If users are not yet loaded, set user_id anyway (will be validated when users load)
            const userExists = users.length === 0 || users.some(user => user.id.toString() === userIdStr);
            
            setFormData({
                project_id: allocation.project_id.toString(),
                user_id: userExists ? userIdStr : '',
                role: allocation.role || '',
                allocation_percentage: allocation.allocation_percentage.toString(),
                start_date: new Date(allocation.start_date).toISOString().split('T')[0],
                end_date: allocation.end_date ? new Date(allocation.end_date).toISOString().split('T')[0] : '',
                notes: allocation.notes || '',
            });
        }
    }, [allocation, isEdit, users]);

    const createMutation = useMutation({
        mutationFn: resourceAllocationService.createAllocation,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-allocations'] });
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/resource-allocations');
            }
        },
        onError: (error: any) => {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        },
    });

    const updateMutation = useMutation({
        mutationFn: (data: Partial<ResourceAllocation>) =>
            resourceAllocationService.updateAllocation(editId!, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['resource-allocations'] });
            if (onSuccess) {
                onSuccess();
            } else {
                navigate('/resource-allocations');
            }
        },
        onError: (error: any) => {
            if (error.response?.data?.errors) {
                setErrors(error.response.data.errors);
            }
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        const payload: Partial<ResourceAllocation> = {
            project_id: parseInt(formData.project_id),
            user_id: parseInt(formData.user_id),
            role: formData.role || undefined,
            allocation_percentage: parseFloat(formData.allocation_percentage),
            start_date: formData.start_date,
            end_date: formData.end_date || undefined,
            notes: formData.notes || undefined,
        };

        if (isEdit) {
            updateMutation.mutate(payload);
        } else {
            createMutation.mutate(payload);
        }
    };

    if (isEdit && isLoading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', p: 4 }}>
                <CircularProgress />
            </Box>
        );
    }

    const isSubmitting = createMutation.isPending || updateMutation.isPending;
    const usersLoading = !usersData;

    // Check if the user_id value exists in the users list
    const isValidUserId = !formData.user_id || users.some(user => user.id.toString() === formData.user_id);
    const displayUserId = isValidUserId ? formData.user_id : '';

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        } else {
            navigate('/resource-allocations');
        }
    };

    return (
        <Box component="form" onSubmit={handleSubmit}>
            {/* Project */}
            <Box sx={{ mb: 3, pt: 2 }}>
                <ProjectSelector
                    value={formData.project_id ? Number(formData.project_id) : undefined}
                    onChange={(id) => setFormData({ ...formData, project_id: id ? id.toString() : '' })}
                    disabled={isEdit}
                    label={t('resourceAllocations.projectLabel')}
                    error={errors.project_id?.[0]}
                />
            </Box>

            {/* User */}
            <TextField
                fullWidth
                select
                label={t('resourceAllocations.userLabel')}
                required
                value={displayUserId}
                onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
                error={!!errors.user_id}
                helperText={errors.user_id?.[0]}
                disabled={isEdit || usersLoading}
                sx={{ mb: 3 }}
            >
                <MenuItem value="">{t('resourceAllocations.selectUser')}</MenuItem>
                {users.map((user) => (
                    <MenuItem key={user.id} value={user.id.toString()}>
                        {user.name} ({user.email})
                    </MenuItem>
                ))}
            </TextField>

            {/* Allocation Percentage */}
            <TextField
                fullWidth
                type="number"
                label={t('resourceAllocations.allocationPercentageLabel')}
                required
                value={formData.allocation_percentage}
                onChange={(e) => setFormData({ ...formData, allocation_percentage: e.target.value })}
                error={!!errors.allocation_percentage}
                helperText={errors.allocation_percentage?.[0]}
                inputProps={{ step: 0.1, min: 0, max: 100 }}
                sx={{ mb: 3 }}
            />

            {/* Role */}
            <TextField
                fullWidth
                label={t('resourceAllocations.roleLabel')}
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder={t('resourceAllocations.rolePlaceholder')}
                sx={{ mb: 3 }}
            />

            {/* Dates */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePicker
                        label={t('resourceAllocations.startDate')}
                        value={formData.start_date || null}
                        onChange={(value) => setFormData({ ...formData, start_date: value || '' })}
                        required
                        fullWidth
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                    <DatePicker
                        label={t('resourceAllocations.endDate')}
                        value={formData.end_date || null}
                        onChange={(value) => setFormData({ ...formData, end_date: value || '' })}
                        fullWidth
                    />
                </Grid>
            </Grid>

            {/* Notes */}
            <TextField
                fullWidth
                multiline
                rows={4}
                label={t('resourceAllocations.notesLabel')}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                sx={{ mb: 3 }}
            />

            {/* Actions */}
            <Box sx={{ display: 'flex', gap: 2 }}>
                <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    fullWidth
                >
                    {isSubmitting ? (
                        <>
                            <CircularProgress size={20} sx={{ mr: 1 }} />
                            {t('common.saving')}
                        </>
                    ) : isEdit ? (
                        t('resourceAllocations.updateAllocation')
                    ) : (
                        t('resourceAllocations.createAllocationButton')
                    )}
                </Button>
                <Button
                    type="button"
                    variant="outlined"
                    onClick={handleCancel}
                >
                    {t('common.cancel')}
                </Button>
            </Box>
        </Box>
    );
}
