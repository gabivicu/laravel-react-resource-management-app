import { describe, it, expect, vi, beforeEach } from 'vitest';
import { taskService } from '@/services/tasks';
import api from '@/services/api';
import type { Task } from '@/types';

vi.mock('@/services/api');

describe('taskService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch tasks', async () => {
        const mockTasks: Task[] = [
            {
                id: 1,
                organization_id: 1,
                project_id: 1,
                title: 'Test Task',
                status: 'todo',
                priority: 'high',
                order: 1,
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
        ];

        vi.mocked(api.get).mockResolvedValue({
            data: {
                success: true,
                data: mockTasks,
            },
        } as any);

        const result = await taskService.getTasks();

        expect(result.data).toEqual(mockTasks);
        expect(api.get).toHaveBeenCalledWith('/tasks', {
            params: { page: 1, per_page: 15 },
        });
    });

    it('should get kanban tasks', async () => {
        const mockKanban = {
            todo: [],
            in_progress: [],
            review: [],
            done: [],
        };

        vi.mocked(api.get).mockResolvedValue({
            data: {
                success: true,
                data: mockKanban,
            },
        } as any);

        const result = await taskService.getKanbanTasks();

        expect(result).toEqual(mockKanban);
    });

    it('should create a task', async () => {
        const mockTask: Task = {
            id: 1,
            organization_id: 1,
            project_id: 1,
            title: 'New Task',
            status: 'todo',
            priority: 'medium',
            order: 1,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        };

        vi.mocked(api.post).mockResolvedValue({
            data: {
                success: true,
                data: mockTask,
            },
        } as any);

        const result = await taskService.createTask({
            project_id: 1,
            title: 'New Task',
        });

        expect(result).toEqual(mockTask);
    });

    it('should update task order', async () => {
        const mockTask: Task = {
            id: 1,
            organization_id: 1,
            project_id: 1,
            title: 'Task',
            status: 'in_progress',
            priority: 'medium',
            order: 5,
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        };

        vi.mocked(api.post).mockResolvedValue({
            data: {
                success: true,
                data: mockTask,
            },
        } as any);

        const result = await taskService.updateTaskOrder(1, 5, 'in_progress');

        expect(result.order).toBe(5);
        expect(result.status).toBe('in_progress');
    });
});
