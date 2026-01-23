import { useInfiniteQuery, useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { userService, UserListResponse } from '@/services/users';
import { roleService } from '@/services/roles';
import { useState, useEffect } from 'react';
import useIntersectionObserver from '@/hooks/useIntersectionObserver';

export default function UserList() {
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
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    const removeRoleMutation = useMutation({
        mutationFn: (userId: number) => userService.removeRole(userId),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['users'] });
        },
    });

    if (isLoading) {
        return (
            <div className="flex items-center justify-center p-8">
                <div className="text-gray-500">Loading users...</div>
            </div>
        );
    }

    const users = data?.pages.flatMap((page) => page.data) || [];
    const roles = rolesData || [];

    return (
        <div className="w-full">
            <h2 className="text-2xl font-bold mb-6">User Management</h2>

            {/* Search */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search users..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="px-3 py-2 border rounded-lg w-full max-w-md"
                />
            </div>

            {/* Users Table */}
            {users.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                    <p>No users found.</p>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg shadow overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 font-medium text-gray-900">{user.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-600">{user.email}</td>
                                        <td className="px-6 py-4">
                                            <select
                                                className="px-2 py-1 border rounded text-sm"
                                                onChange={(e) => {
                                                    const roleId = parseInt(e.target.value);
                                                    if (roleId) {
                                                        assignRoleMutation.mutate({ userId: user.id, roleId });
                                                    } else {
                                                        removeRoleMutation.mutate(user.id);
                                                    }
                                                }}
                                                // Assuming we can get user's role somehow, but User object here might not have role_id directly 
                                                // depending on API Resource. 
                                                // The original code didn't set value={...} so it's uncontrolled or defaults to "No Role" visually.
                                                defaultValue="" 
                                            >
                                                <option value="">No Role</option>
                                                {roles.map((role) => (
                                                    <option key={role.id} value={role.id}>
                                                        {role.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td className="px-6 py-4 text-sm">
                                            <button className="text-blue-600 hover:text-blue-800">
                                                Edit
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Infinite Scroll Sensor */}
                    <div ref={loadMoreRef} className="py-8 flex justify-center">
                        {isFetchingNextPage ? (
                            <div className="text-gray-500 animate-pulse">Loading more users...</div>
                        ) : hasNextPage ? (
                            <div className="text-gray-400 text-sm">Scroll to load more</div>
                        ) : (
                            users.length > 0 && <div className="text-gray-400 text-sm">No more users to load</div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
