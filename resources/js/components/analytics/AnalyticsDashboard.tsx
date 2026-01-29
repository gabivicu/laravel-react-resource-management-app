import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '@/services/analytics';
import {
    Box,
    Typography,
    Card,
    CardContent,
    Grid,
    LinearProgress,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Folder as ProjectIcon,
    Assignment as TaskIcon,
    People as UserIcon,
    TrendingUp as AllocationIcon,
} from '@mui/icons-material';
import { PageHeader, StatCard, EmptyState } from '@/components/ui';

export default function AnalyticsDashboard() {
    const { t } = useTranslation();
    const { data: dashboardStats } = useQuery({
        queryKey: ['analytics', 'dashboard'],
        queryFn: () => analyticsService.getDashboardStats(),
    });

    const { data: projectStats } = useQuery({
        queryKey: ['analytics', 'projects'],
        queryFn: () => analyticsService.getProjectStats(),
    });

    const { data: taskStats } = useQuery({
        queryKey: ['analytics', 'tasks'],
        queryFn: () => analyticsService.getTaskStats(),
    });

    const { data: resourceStats } = useQuery({
        queryKey: ['analytics', 'resources'],
        queryFn: () => analyticsService.getResourceStats(),
    });

    const { data: completionTrend } = useQuery({
        queryKey: ['analytics', 'task-completion-trend'],
        queryFn: () => analyticsService.getTaskCompletionTrend(30),
    });

    const statusChartData = projectStats?.by_status
        ? Object.entries(projectStats.by_status).map(([status, count]) => ({
              status,
              count,
          }))
        : [];

    const priorityChartData = taskStats?.by_priority
        ? Object.entries(taskStats.by_priority).map(([priority, count]) => ({
              priority,
              count,
          }))
        : [];

    const getProjectStatusLabel = (status: string): string => {
        switch (status) {
            case 'planning':
                return t('projects.statusPlanning');
            case 'active':
                return t('projects.statusActive');
            case 'on_hold':
                return t('projects.statusOnHold');
            case 'completed':
                return t('projects.statusCompleted');
            case 'cancelled':
                return t('projects.statusCancelled');
            default:
                return status.replace('_', ' ');
        }
    };

    const getTaskPriorityLabel = (priority: string): string => {
        switch (priority) {
            case 'low':
                return t('tasks.priorityLow');
            case 'medium':
                return t('tasks.priorityMedium');
            case 'high':
                return t('tasks.priorityHigh');
            case 'urgent':
                return t('tasks.priorityUrgent');
            default:
                return priority;
        }
    };

    return (
        <Box>
            <PageHeader title={t('analytics.title')} />

            {/* Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('analytics.totalProjects')}
                        value={dashboardStats?.projects || 0}
                        icon={<ProjectIcon />}
                        color="primary"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('analytics.totalTasks')}
                        value={dashboardStats?.tasks || 0}
                        icon={<TaskIcon />}
                        color="success"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('analytics.users')}
                        value={dashboardStats?.users || 0}
                        icon={<UserIcon />}
                        color="info"
                    />
                </Grid>
                <Grid size={{ xs: 12, sm: 6, lg: 3 }}>
                    <StatCard
                        title={t('analytics.activeAllocations')}
                        value={dashboardStats?.active_allocations || 0}
                        icon={<AllocationIcon />}
                        color="warning"
                    />
                </Grid>
            </Grid>

            {/* Charts */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                {/* Project Status Breakdown */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {t('analytics.projectsByStatus')}
                            </Typography>
                            {statusChartData.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                    {statusChartData.map((item, index) => {
                                        const percentage = (item.count / (projectStats?.total || 1)) * 100;
                                        return (
                                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                                                    {getProjectStatusLabel(item.status)}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 200 }}>
                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            height: 8,
                                                            borderRadius: 1,
                                                            backgroundColor: (theme) =>
                                                                alpha(theme.palette.primary.main, 0.2),
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={percentage}
                                                            sx={{
                                                                height: '100%',
                                                                backgroundColor: 'transparent',
                                                                '& .MuiLinearProgress-bar': {
                                                                    backgroundColor: 'primary.main',
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" fontWeight={600} sx={{ minWidth: 30, textAlign: 'right' }}>
                                                        {item.count}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ) : (
                                <EmptyState type="tasks" description={t('analytics.noDataAvailable')} />
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Task Priority Breakdown */}
                <Grid size={{ xs: 12, lg: 6 }}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider', height: '100%' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {t('analytics.tasksByPriority')}
                            </Typography>
                            {priorityChartData.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                                    {priorityChartData.map((item, index) => {
                                        const percentage = (item.count / (taskStats?.total || 1)) * 100;
                                        return (
                                            <Box key={index} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                <Typography variant="body2" color="text.secondary" sx={{ minWidth: 120 }}>
                                                    {getTaskPriorityLabel(item.priority)}
                                                </Typography>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1, maxWidth: 200 }}>
                                                    <Box
                                                        sx={{
                                                            flex: 1,
                                                            height: 8,
                                                            borderRadius: 1,
                                                            backgroundColor: (theme) =>
                                                                alpha(theme.palette.success.main, 0.2),
                                                            overflow: 'hidden',
                                                        }}
                                                    >
                                                        <LinearProgress
                                                            variant="determinate"
                                                            value={percentage}
                                                            sx={{
                                                                height: '100%',
                                                                backgroundColor: 'transparent',
                                                                '& .MuiLinearProgress-bar': {
                                                                    backgroundColor: 'success.main',
                                                                },
                                                            }}
                                                        />
                                                    </Box>
                                                    <Typography variant="body2" fontWeight={600} sx={{ minWidth: 30, textAlign: 'right' }}>
                                                        {item.count}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        );
                                    })}
                                </Box>
                            ) : (
                                <EmptyState type="tasks" description={t('analytics.noDataAvailable')} />
                            )}
                        </CardContent>
                    </Card>
                </Grid>

                {/* Task Completion Trend */}
                <Grid size={{ xs: 12 }}>
                    <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                        <CardContent>
                            <Typography variant="h6" fontWeight={600} gutterBottom>
                                {t('analytics.taskCompletionTrend')}
                            </Typography>
                            {completionTrend && completionTrend.length > 0 ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mt: 2 }}>
                                    {completionTrend.map((item, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'space-between',
                                                p: 1.5,
                                                borderRadius: 1,
                                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5),
                                            }}
                                        >
                                            <Typography variant="body2" color="text.secondary">
                                                {new Date(item.date).toLocaleDateString()}
                                            </Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {item.count} {t('analytics.tasks')}
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            ) : (
                                <EmptyState type="tasks" description={t('analytics.noDataAvailable')} />
                            )}
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Resource Allocation Stats */}
            {resourceStats && (
                <Card elevation={0} sx={{ border: 1, borderColor: 'divider' }}>
                    <CardContent>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                            {t('analytics.resourceAllocationOverview')}
                        </Typography>
                        <Grid container spacing={3} sx={{ mb: 3 }}>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {t('analytics.totalActiveAllocations')}
                                </Typography>
                                <Typography variant="h4" fontWeight={700}>
                                    {resourceStats.total_active_allocations}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {t('analytics.usersWithAllocations')}
                                </Typography>
                                <Typography variant="h4" fontWeight={700}>
                                    {resourceStats.users_with_allocations}
                                </Typography>
                            </Grid>
                            <Grid size={{ xs: 12, md: 4 }}>
                                <Typography variant="body2" color="text.secondary" gutterBottom>
                                    {t('analytics.totalAllocationPercentage')}
                                </Typography>
                                <Typography variant="h4" fontWeight={700}>
                                    {resourceStats.total_allocation_percentage.toFixed(1)}%
                                </Typography>
                            </Grid>
                        </Grid>
                        {resourceStats.by_project && resourceStats.by_project.length > 0 && (
                            <Box>
                                <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                                    {t('analytics.byProject')}
                                </Typography>
                                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {resourceStats.by_project.map((item, index) => (
                                        <Box
                                            key={index}
                                            sx={{
                                                display: 'flex',
                                                justifyContent: 'space-between',
                                                alignItems: 'center',
                                                p: 1.5,
                                                borderRadius: 1,
                                                backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.5),
                                            }}
                                        >
                                            <Typography variant="body2">{item.project_name}</Typography>
                                            <Typography variant="body2" fontWeight={600}>
                                                {item.total_percentage.toFixed(1)}%
                                            </Typography>
                                        </Box>
                                    ))}
                                </Box>
                            </Box>
                        )}
                    </CardContent>
                </Card>
            )}
        </Box>
    );
}
