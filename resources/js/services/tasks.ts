import api from './api';
import type { Task, ApiResponse } from '@/types';

export interface TaskFilters {
    project_id?: number;
    status?: Task['status'];
    priority?: Task['priority'];
    search?: string;
    sort_by?: 'created_at' | 'title' | 'due_date' | 'priority' | 'status';
    sort_order?: 'asc' | 'desc';
}

export interface TaskListResponse {
    data: Task[];
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

export interface KanbanTasks {
    todo: Task[];
    in_progress: Task[];
    review: Task[];
    done: Task[];
}

export const taskService = {
    /**
     * Get paginated list of tasks
     */
    async getTasks(filters: TaskFilters = {}, page: number = 1, perPage: number = 15): Promise<TaskListResponse> {
        const response = await api.get<ApiResponse<Task[]>>('/tasks', {
            params: {
                ...filters,
                page,
                per_page: perPage,
            },
        });
        
        const responseData = response.data;
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
     * Get tasks grouped by status (for Kanban)
     */
    async getKanbanTasks(projectId?: number): Promise<KanbanTasks> {
        const response = await api.get<ApiResponse<KanbanTasks>>('/tasks/kanban', {
            params: projectId ? { project_id: projectId } : {},
        });
        return response.data.data!;
    },

    /**
     * Get single task by ID
     */
    async getTask(id: number): Promise<Task> {
        const response = await api.get<ApiResponse<Task>>(`/tasks/${id}`);
        return response.data.data!;
    },

    /**
     * Create new task
     */
    async createTask(data: Partial<Task> & { assignee_ids?: number[] }): Promise<Task> {
        const response = await api.post<ApiResponse<Task>>('/tasks', data);
        return response.data.data!;
    },

    /**
     * Update task
     */
    async updateTask(id: number, data: Partial<Task> & { assignee_ids?: number[] }): Promise<Task> {
        const response = await api.put<ApiResponse<Task>>(`/tasks/${id}`, data);
        return response.data.data!;
    },

    /**
     * Update task order (for Kanban drag & drop)
     */
    async updateTaskOrder(id: number, order: number, status?: Task['status']): Promise<Task> {
        const response = await api.post<ApiResponse<Task>>(`/tasks/${id}/order`, {
            order,
            status,
        });
        return response.data.data!;
    },

    /**
     * Delete task
     */
    async deleteTask(id: number): Promise<void> {
        await api.delete<ApiResponse>(`/tasks/${id}`);
    },
};
