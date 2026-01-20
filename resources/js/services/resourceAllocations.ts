import api from './api';
import type { ResourceAllocation, ApiResponse } from '@/types';

export interface ResourceAllocationFilters {
    project_id?: number;
    user_id?: number;
    active?: boolean;
    date_from?: string;
    date_to?: string;
}

export interface ResourceAllocationListResponse {
    data: ResourceAllocation[];
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export const resourceAllocationService = {
    /**
     * Get paginated list of resource allocations
     */
    async getAllocations(filters: ResourceAllocationFilters = {}, perPage: number = 15): Promise<ResourceAllocationListResponse> {
        const response = await api.get<ApiResponse<ResourceAllocation[]>>('/resource-allocations', {
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
     * Get single allocation by ID
     */
    async getAllocation(id: number): Promise<ResourceAllocation> {
        const response = await api.get<ApiResponse<ResourceAllocation>>(`/resource-allocations/${id}`);
        return response.data.data!;
    },

    /**
     * Create new allocation
     */
    async createAllocation(data: Partial<ResourceAllocation>): Promise<ResourceAllocation> {
        const response = await api.post<ApiResponse<ResourceAllocation>>('/resource-allocations', data);
        return response.data.data!;
    },

    /**
     * Update allocation
     */
    async updateAllocation(id: number, data: Partial<ResourceAllocation>): Promise<ResourceAllocation> {
        const response = await api.put<ApiResponse<ResourceAllocation>>(`/resource-allocations/${id}`, data);
        return response.data.data!;
    },

    /**
     * Delete allocation
     */
    async deleteAllocation(id: number): Promise<void> {
        await api.delete<ApiResponse>(`/resource-allocations/${id}`);
    },
};
