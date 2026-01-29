import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { userService, UserListResponse } from '@/services/users';
import { roleService } from '@/services/roles';
import { useState, useEffect } from 'react';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';
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
    TextField,
    Select,
    MenuItem,
    FormControl,
    CircularProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { PageHeader, EmptyState } from '@/components/ui';

export default function UserList() {
    const { t } = useTranslation();
    const [searchFilter, setSearchFilter] = useState<string>('');
    const queryClient = useQueryClient();

    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery<UserListResponse>({
        queryKey: ['users', searchFilter],
        queryFn: ({ pageParam }) => userService.getUsers(
            searchFilter ? { search: searchFilter } : {},
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

    const { data: rolesData } = useQuery({
        queryKey: ['roles'],
        queryFn: () => roleService.getRoles(),
    });

    const [loadMoreRef, isLoadMoreVisible] = useIntersectionObserver({
        rootMargin: '200px',
    });

    useEffect(() => {
        if (isLoadMoreVisible && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
        }
    }, [isLoadMoreVisible, hasNextPage, isFetchingNextPage, fetchNextPage]);

    const assignRoleMutation = useMutation({
        mutationFn: ({ userId, roleId }: { userId: number; roleId: number }) =>
            userService.assignRole(userId, roleId),
        onMutate: async ({ userId, roleId }) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['users'] });

            // Snapshot previous value
            const previousUsers = queryClient.getQueriesData({ queryKey: ['users'] });

            // Optimistically update
            queryClient.setQueriesData({ queryKey: ['users'] }, (old: any) => {
                if (!old) return old;
                
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((user: any) =>
                            user.id === userId ? { ...user, role_id: roleId } : user
                        ),
                    })),
                };
            });

            return { previousUsers };
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousUsers) {
                context.previousUsers.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const removeRoleMutation = useMutation({
        mutationFn: (userId: number) => userService.removeRole(userId),
        onMutate: async (userId) => {
            // Cancel outgoing refetches
            await queryClient.cancelQueries({ queryKey: ['users'] });

            // Snapshot previous value
            const previousUsers = queryClient.getQueriesData({ queryKey: ['users'] });

            // Optimistically update
            queryClient.setQueriesData({ queryKey: ['users'] }, (old: any) => {
                if (!old) return old;
                
                return {
                    ...old,
                    pages: old.pages.map((page: any) => ({
                        ...page,
                        data: page.data.map((user: any) =>
                            user.id === userId ? { ...user, role_id: null } : user
                        ),
                    })),
                };
            });

            return { previousUsers };
        },
        onError: (_err, _variables, context) => {
            // Rollback on error
            if (context?.previousUsers) {
                context.previousUsers.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const users = data?.pages.flatMap((page) => page.data) || [];
    const roles = rolesData || [];

    // Helper function to get valid role_id for Select component
    const getValidRoleId = (userRoleId: number | null | undefined): string | number => {
        if (!userRoleId) return '';
        // Check if role_id exists in available roles
        const roleExists = roles.some(role => role.id === userRoleId);
        return roleExists ? userRoleId : '';
    };

    return (
        <Box>
            <PageHeader title={t('users.title')} />

            {/* Search */}
            <Box sx={{ mb: 3, maxWidth: 400 }}>
                <TextField
                    fullWidth
                    size="small"
                    placeholder={t('users.searchUsers')}
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                />
            </Box>

            {/* Users Table */}
            {isLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                    <CircularProgress />
                </Box>
            ) : users.length === 0 ? (
                <EmptyState type="users" title={t('users.noUsersFound')} />
            ) : (
                <>
                    <TableContainer component={Paper} sx={{ mb: 2 }}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>{t('users.name')}</TableCell>
                                    <TableCell>{t('users.email')}</TableCell>
                                    <TableCell>{t('users.role')}</TableCell>
                                    <TableCell>{t('common.actions')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {users.map((user) => (
                                    <TableRow
                                        key={user.id}
                                        sx={{
                                            '&:hover': {
                                                backgroundColor: (theme) =>
                                                    alpha(theme.palette.primary.main, 0.04),
                                            },
                                        }}
                                    >
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {user.name}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" color="text.secondary">
                                                {user.email}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>
                                            <FormControl size="small" sx={{ minWidth: 150 }}>
                                                <Select
                                                    value={getValidRoleId(user.role_id)}
                                                    onChange={(e) => {
                                                        const roleId = parseInt(e.target.value as string);
                                                        if (roleId) {
                                                            assignRoleMutation.mutate({ userId: user.id, roleId });
                                                        } else {
                                                            removeRoleMutation.mutate(user.id);
                                                        }
                                                    }}
                                                    disabled={roles.length === 0}
                                                >
                                                    <MenuItem value="">{t('users.noRole')}</MenuItem>
                                                    {roles.map((role) => (
                                                        <MenuItem key={role.id} value={role.id}>
                                                            {role.name}
                                                        </MenuItem>
                                                    ))}
                                                </Select>
                                            </FormControl>
                                        </TableCell>
                                        <TableCell>
                                            <Typography
                                                variant="body2"
                                                sx={{
                                                    color: 'primary.main',
                                                    cursor: 'pointer',
                                                    '&:hover': {
                                                        textDecoration: 'underline',
                                                    },
                                                }}
                                            >
                                                {t('users.edit')}
                                            </Typography>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Infinite Scroll Sensor */}
                    <Box ref={loadMoreRef} sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
                        {isFetchingNextPage ? (
                            <CircularProgress size={24} />
                        ) : hasNextPage ? (
                            <Typography variant="body2" color="text.secondary">
                                {t('common.scrollToLoadMore')}
                            </Typography>
                        ) : (
                            users.length > 0 && (
                                <Typography variant="body2" color="text.secondary">
                                    {t('users.noMoreUsers')}
                                </Typography>
                            )
                        )}
                    </Box>
                </>
            )}
        </Box>
    );
}
