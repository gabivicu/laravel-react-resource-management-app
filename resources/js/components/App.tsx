import { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/auth';
import Layout from './layout/Layout';
import Login from './auth/Login';
import Register from './auth/Register';
import Dashboard from './layout/Dashboard';
import ProjectList from './projects/ProjectList';
import ProjectForm from './projects/ProjectForm';
import TaskList from './tasks/TaskList';
import TaskForm from './tasks/TaskForm';
import KanbanBoard from './tasks/KanbanBoard';
import ResourceAllocationList from './resourceAllocations/ResourceAllocationList';
import ResourceAllocationForm from './resourceAllocations/ResourceAllocationForm';
import UserList from './users/UserList';

function App() {
    const { isAuthenticated, logout, setToken, setUser, setCurrentOrganization } = useAuthStore();
    const location = useLocation();

    // Sync Zustand state with localStorage on mount
    useEffect(() => {
        const authToken = localStorage.getItem('auth_token');
        const authStorage = localStorage.getItem('auth-storage');
        
        // If we have auth storage but Zustand says we're not authenticated, restore state
        if (authStorage && authToken) {
            try {
                const authState = JSON.parse(authStorage);
                
                if (authState.state?.isAuthenticated && authState.state?.token === authToken) {
                    // Restore state from storage
                    if (authState.state.user) {
                        setUser(authState.state.user);
                    }
                    if (authState.state.token) {
                        setToken(authState.state.token);
                    }
                    if (authState.state.currentOrganization) {
                        setCurrentOrganization(authState.state.currentOrganization);
                    }
                } else if (authState.state?.token !== authToken) {
                    // Token mismatch - clear state
                    // logout(); 
                }
            } catch (e) {
                console.error('Error parsing auth storage', e);
            }
        } else if (!authToken && isAuthenticated) {
            // Inconsistent state - clear it
            logout();
        }
    }, [logout, setToken, setUser, setCurrentOrganization, isAuthenticated]);

    if (!isAuthenticated) {
        if (location.pathname === '/register') {
            return <Register />;
        }
        return <Login />;
    }

    return (
        <Layout>
            <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/projects" element={<ProjectList />} />
                <Route path="/projects/create" element={<ProjectForm />} />
                <Route path="/projects/:id/edit" element={<ProjectForm />} />
                <Route path="/tasks" element={<TaskList />} />
                <Route path="/tasks/kanban" element={<KanbanBoard />} />
                <Route path="/tasks/create" element={<TaskForm />} />
                <Route path="/tasks/:id/edit" element={<TaskForm />} />
                <Route path="/resource-allocations" element={<ResourceAllocationList />} />
                <Route path="/resource-allocations/create" element={<ResourceAllocationForm />} />
                <Route path="/resource-allocations/:id/edit" element={<ResourceAllocationForm />} />
                <Route path="/users" element={<UserList />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}

export default App;
