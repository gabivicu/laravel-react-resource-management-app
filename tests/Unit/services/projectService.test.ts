import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService } from '@/services/projects';
import api from '@/services/api';
import type { Project } from '@/types';

vi.mock('@/services/api');

describe('projectService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('should fetch projects', async () => {
        const mockProjects: Project[] = [
            {
                id: 1,
                organization_id: 1,
                name: 'Test Project',
                status: 'active',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
        ];

        vi.mocked(api.get).mockResolvedValue({
            data: {
                success: true,
                data: mockProjects,
                pagination: {
                    current_page: 1,
                    last_page: 1,
                    per_page: 15,
                    total: 1,
                },
            },
        } as any);

        const result = await projectService.getProjects();

        expect(result.data).toEqual(mockProjects);
        expect(api.get).toHaveBeenCalledWith('/projects', {
            params: { per_page: 15 },
        });
    });

    it('should create a project', async () => {
        const mockProject: Project = {
            id: 1,
            organization_id: 1,
            name: 'New Project',
            status: 'active',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        };

        vi.mocked(api.post).mockResolvedValue({
            data: {
                success: true,
                data: mockProject,
            },
        } as any);

        const result = await projectService.createProject({
            name: 'New Project',
            status: 'active',
        });

        expect(result).toEqual(mockProject);
        expect(api.post).toHaveBeenCalledWith('/projects', {
            name: 'New Project',
            status: 'active',
        });
    });

    it('should update a project', async () => {
        const mockProject: Project = {
            id: 1,
            organization_id: 1,
            name: 'Updated Project',
            status: 'active',
            created_at: '2024-01-01',
            updated_at: '2024-01-01',
        };

        vi.mocked(api.put).mockResolvedValue({
            data: {
                success: true,
                data: mockProject,
            },
        } as any);

        const result = await projectService.updateProject(1, {
            name: 'Updated Project',
        });

        expect(result).toEqual(mockProject);
        expect(api.put).toHaveBeenCalledWith('/projects/1', {
            name: 'Updated Project',
        });
    });

    it('should delete a project', async () => {
        vi.mocked(api.delete).mockResolvedValue({
            data: { success: true },
        } as any);

        await projectService.deleteProject(1);

        expect(api.delete).toHaveBeenCalledWith('/projects/1');
    });
});
