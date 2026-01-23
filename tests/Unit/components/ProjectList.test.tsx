import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import ProjectList from '@/components/projects/ProjectList';
import { projectService } from '@/services/projects';
import type { Project } from '@/types';

vi.mock('@/services/projects');

// Mock child components to isolate ProjectList
vi.mock('@/components/projects/ProjectDetailsModal', () => ({
    default: () => <div data-testid="project-details-modal">Mock Details Modal</div>
}));

vi.mock('@/components/projects/ProjectForm', () => ({
    default: () => <div data-testid="project-form">Mock Form</div>
}));

describe('ProjectList', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
        vi.clearAllMocks();
    });

    const renderComponent = () => {
        return render(
            <QueryClientProvider client={queryClient}>
                <BrowserRouter>
                    <ProjectList />
                </BrowserRouter>
            </QueryClientProvider>
        );
    };

    it('should display loading state', () => {
        vi.mocked(projectService.getProjects).mockImplementation(
            () => new Promise(() => {}) // Never resolves
        );

        renderComponent();

        expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    });

    it('should display projects list', async () => {
        const mockProjects: Project[] = [
            {
                id: 1,
                organization_id: 1,
                name: 'Test Project 1',
                status: 'active',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
            {
                id: 2,
                organization_id: 1,
                name: 'Test Project 2',
                status: 'completed',
                created_at: '2024-01-01',
                updated_at: '2024-01-01',
            },
        ];

        vi.mocked(projectService.getProjects).mockResolvedValue({
            data: mockProjects,
            pagination: { current_page: 1, last_page: 1, per_page: 15, total: 2 }
        } as any);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Test Project 1')).toBeInTheDocument();
            expect(screen.getByText('Test Project 2')).toBeInTheDocument();
        });
    });

    it('should display empty state when no projects', async () => {
        vi.mocked(projectService.getProjects).mockResolvedValue({
            data: [],
            pagination: { current_page: 1, last_page: 1, per_page: 15, total: 0 }
        } as any);

        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('No projects found matching your criteria.')).toBeInTheDocument();
        });
    });
});
