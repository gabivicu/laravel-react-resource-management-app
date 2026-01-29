import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import TaskForm from '@/components/tasks/TaskForm';
import { taskService } from '@/services/tasks';
import { projectService } from '@/services/projects';

vi.mock('@/services/tasks');
vi.mock('@/services/projects');
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom');
    return {
        ...actual,
        useNavigate: () => vi.fn(),
        useParams: () => ({}),
    };
});

describe('TaskForm', () => {
    let queryClient: QueryClient;

    beforeEach(() => {
        queryClient = new QueryClient({
            defaultOptions: {
                queries: { retry: false },
            },
        });
        vi.clearAllMocks();

        vi.mocked(projectService.getProjects).mockResolvedValue({
            data: [
                {
                    id: 1,
                    organization_id: 1,
                    name: 'Test Project',
                    created_at: '2024-01-01',
                    updated_at: '2024-01-01',
                },
            ],
        });
    });

    const renderComponent = () => {
        return render(
            <LocalizationProvider dateAdapter={AdapterDateFns}>
                <QueryClientProvider client={queryClient}>
                    <BrowserRouter>
                        <TaskForm />
                    </BrowserRouter>
                </QueryClientProvider>
            </LocalizationProvider>
        );
    };

    it('should render task form', async () => {
        renderComponent();

        await waitFor(() => {
            expect(screen.getByText('Create New Task')).toBeInTheDocument();
            expect(screen.getByPlaceholderText(/search projects/i)).toBeInTheDocument();
            expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
        });
    });

    it('should validate required fields', async () => {
        const user = userEvent.setup();
        renderComponent();

        await waitFor(() => {
            expect(screen.getByRole('button', { name: /create task/i })).toBeInTheDocument();
        });

        const submitButton = screen.getByRole('button', { name: /create task/i });
        
        await act(async () => {
            await user.click(submitButton);
        });

        // Form validation should prevent submission
        expect(taskService.createTask).not.toHaveBeenCalled();
    });
});
