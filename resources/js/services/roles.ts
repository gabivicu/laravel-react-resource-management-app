import api from './api';
import type { Role, Permission, ApiResponse } from '@/types';

export const roleService = {
    /**
     * Get all roles
     */
    async getRoles(): Promise<Role[]> {
        const response = await api.get<ApiResponse<Role[]>>('/roles');
        return response.data.data || [];
    },

    /**
     * Get all permissions
     */
    async getPermissions(): Promise<Permission[]> {
        const response = await api.get<ApiResponse<Permission[]>>('/roles/permissions');
        return response.data.data || [];
    },

    /**
     * Get single role by ID
     */
    async getRole(id: number): Promise<Role> {
        const response = await api.get<ApiResponse<Role>>(`/roles/${id}`);
        return response.data.data!;
    },

    /**
     * Create new role
     */
    async createRole(data: Partial<Role> & { permission_ids?: number[] }): Promise<Role> {
        const response = await api.post<ApiResponse<Role>>('/roles', data);
        return response.data.data!;
    },

    /**
     * Update role
     */
    async updateRole(id: number, data: Partial<Role> & { permission_ids?: number[] }): Promise<Role> {
        const response = await api.put<ApiResponse<Role>>(`/roles/${id}`, data);
        return response.data.data!;
    },

    /**
     * Delete role
     */
    async deleteRole(id: number): Promise<void> {
        await api.delete<ApiResponse>(`/roles/${id}`);
    },
};
