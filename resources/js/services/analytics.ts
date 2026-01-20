import api from './api';
import type { ApiResponse } from '@/types';

export interface DashboardStats {
    projects: number;
    tasks: number;
    users: number;
    active_allocations: number;
}

export interface ProjectStats {
    total: number;
    by_status: Record<string, number>;
    average_tasks_per_project: number;
}

export interface TaskStats {
    total: number;
    by_status: Record<string, number>;
    by_priority: Record<string, number>;
    total_estimated_hours: number;
    total_actual_hours: number;
    completion_rate: number;
}

export interface ResourceStats {
    total_active_allocations: number;
    users_with_allocations: number;
    total_allocation_percentage: number;
    by_project: Array<{
        project_name: string;
        allocations_count: number;
        total_percentage: number;
    }>;
}

export interface TaskCompletionTrend {
    date: string;
    count: number;
}

export const analyticsService = {
    /**
     * Get dashboard statistics
     */
    async getDashboardStats(): Promise<DashboardStats> {
        const response = await api.get<ApiResponse<DashboardStats>>('/analytics/dashboard');
        return response.data.data!;
    },

    /**
     * Get project statistics
     */
    async getProjectStats(): Promise<ProjectStats> {
        const response = await api.get<ApiResponse<ProjectStats>>('/analytics/projects');
        return response.data.data!;
    },

    /**
     * Get task statistics
     */
    async getTaskStats(): Promise<TaskStats> {
        const response = await api.get<ApiResponse<TaskStats>>('/analytics/tasks');
        return response.data.data!;
    },

    /**
     * Get resource statistics
     */
    async getResourceStats(): Promise<ResourceStats> {
        const response = await api.get<ApiResponse<ResourceStats>>('/analytics/resources');
        return response.data.data!;
    },

    /**
     * Get task completion trend
     */
    async getTaskCompletionTrend(days: number = 30): Promise<TaskCompletionTrend[]> {
        const response = await api.get<ApiResponse<TaskCompletionTrend[]>>('/analytics/task-completion-trend', {
            params: { days },
        });
        return response.data.data || [];
    },
};
