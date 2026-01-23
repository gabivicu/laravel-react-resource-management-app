import api from './api';
import type { Project, ApiResponse } from '@/types';

export interface ProjectFilters {
    status?: Project['status'];
    search?: string;
}

export interface ProjectListResponse {
    data: Project[];
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export const projectService = {
    /**
     * Get paginated list of projects
     */
    async getProjects(filters: ProjectFilters = {}, page: number = 1, perPage: number = 15): Promise<ProjectListResponse> {
        const response = await api.get<ApiResponse<Project[]>>('/projects', {
            params: {
                ...filters,
                page,
                per_page: perPage,
            },
        });
        // Check if data is wrapped in 'data' property (Laravel Resource default) or if it's the root object
        const responseData = response.data;
        
        // Handle Laravel's standard pagination structure
        const pagination = responseData.meta || responseData.pagination || {
            current_page: responseData.current_page,
            last_page: responseData.last_page,
            per_page: responseData.per_page,
            total: responseData.total
        };

        return {
            data: responseData.data || [],
            pagination: pagination as any,
        };
    },

    /**
     * Get single project by ID
     */
    async getProject(id: number): Promise<Project> {
        const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
        return response.data.data!;
    },

    /**
     * Create new project
     */
    async createProject(data: Partial<Project>): Promise<Project> {
        const response = await api.post<ApiResponse<Project>>('/projects', data);
        return response.data.data!;
    },

    /**
     * Update project
     */
    async updateProject(id: number, data: Partial<Project>): Promise<Project> {
        const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, data);
        return response.data.data!;
    },

    /**
     * Delete project
     */
    async deleteProject(id: number): Promise<void> {
        await api.delete<ApiResponse>(`/projects/${id}`);
    },
};
