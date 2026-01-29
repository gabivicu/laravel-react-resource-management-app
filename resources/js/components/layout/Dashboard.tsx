import {
    Box,
    Grid,
    Typography,
    Card,
    CardContent,
    LinearProgress,
    Skeleton,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Folder as ProjectIcon,
    Assignment as TaskIcon,
    People as UserIcon,
    TrendingUp as TrendIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';
import { projectService } from '@/services/projects';
import { taskService } from '@/services/tasks';
import { StatCard } from '@/components/ui';
import MiniChart from '@/components/dashboard/MiniChart';
import RecentActivity from '@/components/dashboard/RecentActivity';

export default function Dashboard() {
    const { t } = useTranslation();
    
    const { data: dashboardStats, isLoading: statsLoading } = useQuery({
        queryKey: ['analytics', 'dashboard'],
        queryFn: () => analyticsService.getDashboardStats(),
    });

    const { data: projectStats, isLoading: projectStatsLoading } = useQuery({
        queryKey: ['analytics', 'projects'],
        queryFn: () => analyticsService.getProjectStats(),
    });

    const { data: taskStats, isLoading: taskStatsLoading } = useQuery({
        queryKey: ['analytics', 'tasks'],
        queryFn: () => analyticsService.getTaskStats(),
    });

    const { data: recentProjects } = useQuery({
        queryKey: ['projects', 'recent'],
        queryFn: () => projectService.getProjects({}, 5),
    });

    const { data: recentTasks } = useQuery({
        queryKey: ['tasks', 'recent'],
        queryFn: () => taskService.getTasks({}, 5),
    });

    const projectsCount = dashboardStats?.projects || 0;
    const tasksCount = dashboardStats?.tasks || 0;
    const usersCount = dashboardStats?.users || 0;
    const allocationsCount = dashboardStats?.active_allocations || 0;

    // Prepare chart data
    const projectStatusData = projectStats?.by_status
        ? Object.entries(projectStats.by_status).map(([label, value]) => ({
              label,
              value: value as number,
          }))
        : [];

    const taskStatusData = taskStats?.by_status
        ? Object.entries(taskStats.by_status).map(([label, value]) => ({
              label,
              value: value as number,
          }))
        : [];

    const taskPriorityData = taskStats?.by_priority
        ? Object.entries(taskStats.by_priority).map(([label, value]) => ({
              label,
              value: value as number,
          }))
        : [];

    // Calculate completion rate
    const completionRate = taskStats?.completion_rate || 0;
    const totalEstimated = taskStats?.total_estimated_hours || 0;
    const totalActual = taskStats?.total_actual_hours || 0;

    // Prepare recent items
    const recentProjectsList =
        recentProjects?.data.map((p) => ({
            id: p.id,
            title: p.name,
            type: 'project' as const,
            status: p.status,
            updatedAt: p.updated_at,
        })) || [];

    const recentTasksList =
        recentTasks?.data.map((t) => ({
            id: t.id,
            title: t.title,
            type: 'task' as const,
            status: t.status,
            priority: t.priority,
            updatedAt: t.updated_at,
        })) || [];

    const isLoading = statsLoading || projectStatsLoading || taskStatsLoading;

    return (
        <Box sx={{ animation: 'fadeIn 0.5s ease-out' }}>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h3"
                    fontWeight={700}
                    sx={{
                        background: (theme) =>
                            theme.palette.mode === 'dark'
                                ? 'linear-gradient(135deg, #F8FAFC 0%, #94A3B8 100%)'
                                : 'linear-gradient(135deg, #0F172A 0%, #334155 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        backgroundClip: 'text',
                    }}
                >
                    {t('dashboard.title')}
                </Typography>
                <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                    {t('dashboard.welcomeBack')}
                </Typography>
            </Box>

            {/* Stats Grid */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.projects')}
                        value={projectsCount}
                        icon={<ProjectIcon />}
                        color="primary"
                        link="/projects"
                        loading={isLoading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.tasks')}
                        value={tasksCount}
                        icon={<TaskIcon />}
                        color="success"
                        link="/tasks"
                        loading={isLoading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.teamMembers')}
                        value={usersCount}
                        icon={<UserIcon />}
                        color="info"
                        link="/users"
                        loading={isLoading}
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('dashboard.activeAllocations')}
                        value={allocationsCount}
                        icon={<TrendIcon />}
                        color="warning"
                        link="/resource-allocations"
                        loading={isLoading}
                    />
                </Grid>
            </Grid>

            {/* Charts Section */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {isLoading ? (
                    <>
                        {[1, 2, 3].map((i) => (
                            <Grid size={{ xs: 12, lg: 4 }} key={i}>
                                <Card>
                                    <CardContent>
                                        <Skeleton variant="text" width="60%" height={28} />
                                        <Skeleton variant="rectangular" height={200} sx={{ mt: 2 }} />
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </>
                ) : (
                    <>
                        {taskStatusData.length > 0 && (
                            <Grid size={{ xs: 12, lg: 4 }}>
                                <MiniChart data={taskStatusData} title={t('dashboard.tasksByStatus')} />
                            </Grid>
                        )}
                        {taskPriorityData.length > 0 && (
                            <Grid size={{ xs: 12, lg: 4 }}>
                                <MiniChart data={taskPriorityData} title={t('dashboard.tasksByPriority')} />
                            </Grid>
                        )}
                        {projectStatusData.length > 0 && (
                            <Grid size={{ xs: 12, lg: 4 }}>
                                <MiniChart data={projectStatusData} title={t('dashboard.projectsByStatus')} />
                            </Grid>
                        )}
                    </>
                )}
            </Grid>

            {/* Progress and Recent Activity */}
            <Grid container spacing={3}>
                {/* Task Completion Progress */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <Card sx={{ height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {t('dashboard.taskProgress')}
                            </Typography>

                            {isLoading ? (
                                <>
                                    <Skeleton variant="text" width="80%" />
                                    <Skeleton variant="rectangular" height={8} sx={{ my: 2 }} />
                                    <Skeleton variant="text" width="60%" />
                                    <Skeleton variant="text" width="50%" />
                                </>
                            ) : (
                                <Box sx={{ mt: 3 }}>
                                    {/* Completion Rate */}
                                    <Box sx={{ mb: 3 }}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('dashboard.completionRate')}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600} color="success.main">
                                                {completionRate.toFixed(0)}%
                                            </Typography>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={completionRate}
                                            sx={{
                                                height: 10,
                                                borderRadius: 5,
                                                backgroundColor: (theme) =>
                                                    alpha(theme.palette.success.main, 0.15),
                                                '& .MuiLinearProgress-bar': {
                                                    borderRadius: 5,
                                                    background: 'linear-gradient(90deg, #10B981 0%, #34D399 100%)',
                                                },
                                            }}
                                        />
                                    </Box>

                                    {/* Hours Stats */}
                                    <Box
                                        sx={{
                                            pt: 2,
                                            borderTop: 1,
                                            borderColor: 'divider',
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                mb: 1.5,
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                {t('dashboard.estimatedHours')}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {totalEstimated.toFixed(1)}h
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                                            <Typography variant="body2" color="text.secondary">
                                                {t('dashboard.actualHours')}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {totalActual.toFixed(1)}h
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Box>
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Recent Projects */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <RecentActivity items={recentProjectsList} type="projects" loading={isLoading} />
                </Grid>

                {/* Recent Tasks */}
                <Grid size={{ xs: 12, lg: 4 }}>
                    <RecentActivity items={recentTasksList} type="tasks" loading={isLoading} />
                </Grid>
            </Grid>
        </Box>
    );
}
