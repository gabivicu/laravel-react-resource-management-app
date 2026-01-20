import api from './api';
import type { User, ApiResponse } from '@/types';

export interface UserFilters {
    search?: string;
}

export interface UserListResponse {
    data: User[];
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export const userService = {
    /**
     * Get paginated list of users
     */
    async getUsers(filters: UserFilters = {}, perPage: number = 15): Promise<UserListResponse> {
        const response = await api.get<ApiResponse<User[]>>('/users', {
            params: {
                ...filters,
                per_page: perPage,
            },
        });
        return {
            data: response.data.data || [],
            pagination: response.data.pagination,
        };
    },

    /**
     * Get single user by ID
     */
    async getUser(id: number): Promise<User> {
        const response = await api.get<ApiResponse<User>>(`/users/${id}`);
        return response.data.data!;
    },

    /**
     * Update user
     */
    async updateUser(id: number, data: Partial<User>): Promise<User> {
        const response = await api.put<ApiResponse<User>>(`/users/${id}`, data);
        return response.data.data!;
    },

    /**
     * Assign role to user
     */
    async assignRole(id: number, roleId: number): Promise<void> {
        await api.post<ApiResponse>(`/users/${id}/assign-role`, { role_id: roleId });
    },

    /**
     * Remove role from user
     */
    async removeRole(id: number): Promise<void> {
        await api.post<ApiResponse>(`/users/${id}/remove-role`);
    },
};
