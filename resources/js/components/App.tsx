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
import AnalyticsDashboard from './analytics/AnalyticsDashboard';

function App() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
    const location = useLocation();

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
                <Route path="/analytics" element={<AnalyticsDashboard />} />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Layout>
    );
}

export default App;
