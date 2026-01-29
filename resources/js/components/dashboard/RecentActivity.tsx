import { Link } from 'react-router-dom';
import {
    Card,
    CardContent,
    Typography,
    List,
    ListItem,
    ListItemButton,
    ListItemText,
    Box,
    Skeleton,
    Chip,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useTranslation } from 'react-i18next';
import { 
    Folder as ProjectIcon, 
    Assignment as TaskIcon,
    ArrowForward as ArrowIcon,
} from '@mui/icons-material';

interface ActivityItem {
    id: number;
    title: string;
    type: 'project' | 'task';
    status: string;
    priority?: string;
    updatedAt: string;
}

interface RecentActivityProps {
    items: ActivityItem[];
    type: 'projects' | 'tasks';
    loading?: boolean;
}

// Status colors
const statusColors: Record<string, string> = {
    // Project statuses
    planning: '#64748B',
    active: '#10B981',
    on_hold: '#F59E0B',
    completed: '#3B82F6',
    cancelled: '#EF4444',
    // Task statuses
    todo: '#64748B',
    in_progress: '#3B82F6',
    review: '#F59E0B',
    done: '#10B981',
};

const formatLabel = (label: string): string => {
    return label
        .split('_')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
};

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
        return 'Today';
    } else if (diffDays === 1) {
        return 'Yesterday';
    } else if (diffDays < 7) {
        return `${diffDays} days ago`;
    } else {
        return date.toLocaleDateString();
    }
};

export default function RecentActivity({ items, type, loading = false }: RecentActivityProps) {
    const { t } = useTranslation();

    const title = type === 'projects' 
        ? t('dashboard.recentProjects') || 'Recent Projects' 
        : t('dashboard.recentTasks') || 'Recent Tasks';

    const Icon = type === 'projects' ? ProjectIcon : TaskIcon;
    const linkPath = type === 'projects' ? '/projects' : '/tasks';

    return (
        <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', p: 0 }}>
                {/* Header */}
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        p: 3,
                        pb: 2,
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Box
                            sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 36,
                                height: 36,
                                borderRadius: 2,
                                backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                            }}
                        >
                            <Icon fontSize="small" />
                        </Box>
                        <Typography variant="h6" fontWeight={600}>
                            {title}
                        </Typography>
                    </Box>
                </Box>

                {/* List */}
                {loading ? (
                    <Box sx={{ px: 2, pb: 2 }}>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <Box key={i} sx={{ py: 1.5 }}>
                                <Skeleton variant="text" width="80%" height={24} />
                                <Skeleton variant="text" width="40%" height={18} />
                            </Box>
                        ))}
                    </Box>
                ) : items.length === 0 ? (
                    <Box
                        sx={{
                            flex: 1,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'text.secondary',
                            py: 4,
                        }}
                    >
                        <Typography variant="body2">
                            No recent {type} found
                        </Typography>
                    </Box>
                ) : (
                    <List disablePadding sx={{ flex: 1 }}>
                        {items.map((item, index) => {
                            const statusColor = statusColors[item.status] || '#64748B';

                            return (
                                <ListItem 
                                    key={item.id} 
                                    disablePadding
                                    sx={{
                                        animation: 'fadeInUp 0.3s ease-out',
                                        animationDelay: `${index * 50}ms`,
                                        animationFillMode: 'backwards',
                                    }}
                                >
                                    <ListItemButton
                                        component={Link}
                                        to={`${linkPath}/${item.id}/edit`}
                                        sx={{
                                            px: 3,
                                            py: 1.5,
                                            '&:hover': {
                                                backgroundColor: (theme) =>
                                                    alpha(theme.palette.primary.main, 0.04),
                                            },
                                        }}
                                    >
                                        <ListItemText
                                            primary={item.title}
                                            secondary={formatDate(item.updatedAt)}
                                            primaryTypographyProps={{
                                                fontWeight: 500,
                                                noWrap: true,
                                                fontSize: '0.9rem',
                                            }}
                                            secondaryTypographyProps={{
                                                fontSize: '0.75rem',
                                            }}
                                        />
                                        <Chip
                                            label={formatLabel(item.status)}
                                            size="small"
                                            sx={{
                                                backgroundColor: alpha(statusColor, 0.15),
                                                color: statusColor,
                                                fontWeight: 600,
                                                fontSize: '0.7rem',
                                                height: 22,
                                            }}
                                        />
                                    </ListItemButton>
                                </ListItem>
                            );
                        })}
                    </List>
                )}

                {/* Footer */}
                <Box
                    component={Link}
                    to={linkPath}
                    sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                        py: 2,
                        borderTop: 1,
                        borderColor: 'divider',
                        color: 'text.secondary',
                        textDecoration: 'none',
                        transition: 'all 0.2s ease',
                        '&:hover': {
                            color: 'primary.main',
                            backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.04),
                        },
                    }}
                >
                    <Typography variant="body2" fontWeight={500}>
                        View all {type}
                    </Typography>
                    <ArrowIcon fontSize="small" />
                </Box>
            </CardContent>
        </Card>
    );
}
