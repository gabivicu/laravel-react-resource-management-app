import { Link, useLocation } from 'react-router-dom';
import {
    Drawer,
    Box,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Typography,
    Divider,
    useMediaQuery,
} from '@mui/material';
import { alpha, useTheme as useMuiTheme } from '@mui/material/styles';
import {
    Dashboard as DashboardIcon,
    Folder as FolderIcon,
    Assignment as TaskIcon,
    Group as GroupIcon,
    Person as PersonIcon,
    ViewKanban as KanbanIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface SidebarProps {
    open: boolean;
    onClose: () => void;
    width: number;
    variant?: 'permanent' | 'persistent' | 'temporary';
}

export default function Sidebar({ open, onClose, width, variant = 'persistent' }: SidebarProps) {
    const { t } = useTranslation();
    const location = useLocation();
    const muiTheme = useMuiTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('lg'));

    const navItems = [
        { path: '/', label: t('navigation.dashboard'), icon: DashboardIcon },
        { path: '/projects', label: t('navigation.projects'), icon: FolderIcon },
        { path: '/tasks/kanban', label: t('navigation.kanban') || 'Kanban Board', icon: KanbanIcon },
        { path: '/tasks', label: t('navigation.tasks'), icon: TaskIcon },
        { path: '/resource-allocations', label: t('navigation.resourceAllocations'), icon: GroupIcon },
        { path: '/users', label: t('navigation.users'), icon: PersonIcon },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/';
        
        // Check for exact match
        if (location.pathname === path) return true;
        
        // For routes that are not exact match, check if pathname starts with path + '/'
        // But only if there's no more specific route that matches better
        if (location.pathname.startsWith(path + '/')) {
            // Check if there's a more specific route that matches better
            const hasMoreSpecificMatch = navItems.some(item => 
                item.path !== path && 
                item.path.startsWith(path + '/') && 
                (location.pathname === item.path || location.pathname.startsWith(item.path + '/'))
            );
            // If there's a more specific route that matches, don't mark this route as active
            return !hasMoreSpecificMatch;
        }
        
        return false;
    };

    const drawerContent = (
        <Box
            sx={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                backgroundColor: 'background.paper',
            }}
        >
            {/* Logo Section */}
            <Box
                sx={{
                    p: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                }}
            >
                <Box
                    sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2.5,
                        background: 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 8px 24px rgba(255, 193, 7, 0.25)',
                    }}
                >
                    <Typography 
                        variant="h5" 
                        fontWeight={800}
                        sx={{ color: '#0F172A' }}
                    >
                        RM
                    </Typography>
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight={700} color="text.primary">
                        Resource
                    </Typography>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                        Management
                    </Typography>
                </Box>
            </Box>

            <Divider sx={{ mx: 2 }} />

            {/* Navigation */}
            <Box sx={{ flex: 1, py: 2, px: 2, overflow: 'auto' }}>
                <Typography
                    variant="overline"
                    sx={{
                        px: 1.5,
                        mb: 1,
                        display: 'block',
                        color: 'text.secondary',
                        letterSpacing: '0.08em',
                    }}
                >
                    Navigation
                </Typography>

                <List disablePadding>
                    {navItems.map((item, index) => {
                        const Icon = item.icon;
                        const active = isActive(item.path);

                        return (
                            <ListItem 
                                key={item.path} 
                                disablePadding 
                                sx={{ 
                                    mb: 0.5,
                                    animation: 'fadeInUp 0.4s ease-out',
                                    animationDelay: `${index * 50}ms`,
                                    animationFillMode: 'backwards',
                                }}
                            >
                                <ListItemButton
                                    component={Link}
                                    to={item.path}
                                    onClick={() => isMobile && onClose()}
                                    selected={active}
                                    sx={{
                                        borderRadius: 2,
                                        py: 1.25,
                                        px: 1.5,
                                        transition: 'all 0.2s ease',
                                        '&.Mui-selected': {
                                            backgroundColor: (theme) => 
                                                alpha(theme.palette.primary.main, 0.12),
                                            '&:hover': {
                                                backgroundColor: (theme) => 
                                                    alpha(theme.palette.primary.main, 0.16),
                                            },
                                            '& .MuiListItemIcon-root': {
                                                color: 'primary.main',
                                            },
                                            '& .MuiListItemText-primary': {
                                                color: 'primary.main',
                                                fontWeight: 600,
                                            },
                                        },
                                        '&:hover': {
                                            backgroundColor: (theme) => 
                                                alpha(theme.palette.primary.main, 0.08),
                                            transform: 'translateX(4px)',
                                        },
                                    }}
                                >
                                    <ListItemIcon
                                        sx={{
                                            minWidth: 40,
                                            color: active ? 'primary.main' : 'text.secondary',
                                            transition: 'color 0.2s ease',
                                        }}
                                    >
                                        <Icon fontSize="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary={item.label}
                                        primaryTypographyProps={{
                                            fontSize: '0.9rem',
                                            fontWeight: active ? 600 : 500,
                                        }}
                                    />
                                    {active && (
                                        <Box
                                            sx={{
                                                width: 4,
                                                height: 24,
                                                borderRadius: 1,
                                                backgroundColor: 'primary.main',
                                                ml: 1,
                                            }}
                                        />
                                    )}
                                </ListItemButton>
                            </ListItem>
                        );
                    })}
                </List>
            </Box>

            {/* Footer */}
            <Box
                sx={{
                    p: 2,
                    borderTop: 1,
                    borderColor: 'divider',
                }}
            >
                <Box
                    sx={{
                        p: 2,
                        borderRadius: 2,
                        backgroundColor: (theme) => alpha(theme.palette.primary.main, 0.08),
                        textAlign: 'center',
                    }}
                >
                    <Typography variant="caption" color="text.secondary" display="block">
                        Resource Management SaaS
                    </Typography>
                    <Typography variant="caption" color="primary.main" fontWeight={600}>
                        v1.0.0
                    </Typography>
                </Box>
            </Box>
        </Box>
    );

    return (
        <Drawer
            variant={variant}
            open={open}
            onClose={onClose}
            ModalProps={{
                keepMounted: true, // Better performance on mobile
            }}
            PaperProps={{
                sx: {
                    width,
                    border: 'none',
                    backgroundColor: 'background.paper',
                    borderRight: 1,
                    borderColor: 'divider',
                },
            }}
            sx={{
                width: open ? width : 0,
                flexShrink: 0,
                '& .MuiDrawer-paper': {
                    width,
                    boxSizing: 'border-box',
                },
            }}
        >
            {drawerContent}
        </Drawer>
    );
}
