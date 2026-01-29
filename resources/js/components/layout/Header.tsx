import { useState } from 'react';
import {
    AppBar,
    Toolbar,
    IconButton,
    Typography,
    Box,
    Avatar,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Tooltip,
    Badge,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import {
    Menu as MenuIcon,
    Person as PersonIcon,
    Logout as LogoutIcon,
    DarkMode as DarkModeIcon,
    LightMode as LightModeIcon,
    Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth';
import { useTheme } from '@/theme/ThemeContext';
import LanguageSelector from '../ui/LanguageSelector';

interface HeaderProps {
    onMenuClick?: () => void;
    onEditProfile?: () => void;
    sidebarOpen?: boolean;
}

export default function Header({ onMenuClick, onEditProfile, sidebarOpen }: HeaderProps) {
    const { t } = useTranslation();
    const { toggleMode, isDark } = useTheme();
    const authStore = useAuthStore();
    const user = authStore.user;
    const logout = authStore.logout;
    const currentOrganization = authStore.currentOrganization;
    
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const menuOpen = Boolean(anchorEl);

    const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const handleEditProfile = () => {
        handleMenuClose();
        onEditProfile?.();
    };

    const handleLogout = () => {
        handleMenuClose();
        logout();
    };

    const getInitials = (name: string) => {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    return (
        <AppBar
            position="sticky"
            elevation={0}
            sx={{
                backgroundColor: (theme) => 
                    theme.palette.mode === 'dark' 
                        ? alpha(theme.palette.background.paper, 0.8)
                        : alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(12px)',
                borderBottom: 1,
                borderColor: 'divider',
            }}
        >
            <Toolbar sx={{ gap: 1, minHeight: { xs: 64, sm: 70 } }}>
                {/* Menu Button */}
                <IconButton
                    onClick={onMenuClick}
                    edge="start"
                    sx={{
                        color: 'text.primary',
                        backgroundColor: sidebarOpen 
                            ? (theme) => alpha(theme.palette.primary.main, 0.1)
                            : 'transparent',
                    }}
                >
                    <MenuIcon />
                </IconButton>

                {/* Logo & Brand */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 40,
                            height: 40,
                            borderRadius: 2,
                            background: 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 12px rgba(255, 193, 7, 0.3)',
                        }}
                    >
                        <Typography 
                            variant="h6" 
                            fontWeight={700}
                            sx={{ color: '#0F172A' }}
                        >
                            RM
                        </Typography>
                    </Box>
                    <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                        <Typography 
                            variant="h6" 
                            fontWeight={700}
                            sx={{ 
                                color: 'text.primary',
                                lineHeight: 1.2,
                            }}
                        >
                            {t('header.appName')}
                        </Typography>
                        {currentOrganization && (
                            <Typography 
                                variant="caption" 
                                sx={{ 
                                    color: 'text.secondary',
                                    display: 'block',
                                }}
                            >
                                {currentOrganization.name}
                            </Typography>
                        )}
                    </Box>
                </Box>

                {/* Spacer */}
                <Box sx={{ flexGrow: 1 }} />

                {/* Actions */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {/* Theme Toggle */}
                    <Tooltip title={isDark ? 'Light mode' : 'Dark mode'}>
                        <IconButton
                            onClick={toggleMode}
                            sx={{ color: 'text.secondary' }}
                        >
                            {isDark ? <LightModeIcon /> : <DarkModeIcon />}
                        </IconButton>
                    </Tooltip>

                    {/* Notifications */}
                    <Tooltip title="Notifications">
                        <IconButton sx={{ color: 'text.secondary' }}>
                            <Badge badgeContent={3} color="error">
                                <NotificationsIcon />
                            </Badge>
                        </IconButton>
                    </Tooltip>

                    {/* Language Selector */}
                    <LanguageSelector />

                    {/* User Menu */}
                    <Box sx={{ ml: 1 }}>
                        <Tooltip title="Account settings">
                            <IconButton
                                onClick={handleMenuOpen}
                                sx={{
                                    p: 0.5,
                                    border: 2,
                                    borderColor: menuOpen ? 'primary.main' : 'transparent',
                                    transition: 'border-color 0.2s ease',
                                }}
                            >
                                <Avatar
                                    src={user?.avatar}
                                    alt={user?.name}
                                    sx={{
                                        width: 36,
                                        height: 36,
                                        bgcolor: 'primary.main',
                                        color: 'primary.contrastText',
                                        fontWeight: 600,
                                        fontSize: '0.875rem',
                                    }}
                                >
                                    {user?.name ? getInitials(user.name) : 'U'}
                                </Avatar>
                            </IconButton>
                        </Tooltip>

                        <Menu
                            anchorEl={anchorEl}
                            open={menuOpen}
                            onClose={handleMenuClose}
                            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                            PaperProps={{
                                sx: { 
                                    minWidth: 220,
                                    mt: 1,
                                },
                            }}
                        >
                            {/* User Info */}
                            <Box sx={{ px: 2, py: 1.5 }}>
                                <Typography variant="subtitle1" fontWeight={600}>
                                    {user?.name}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    {user?.email}
                                </Typography>
                            </Box>
                            
                            <Divider sx={{ my: 1 }} />

                            <MenuItem onClick={handleEditProfile}>
                                <ListItemIcon>
                                    <PersonIcon fontSize="small" />
                                </ListItemIcon>
                                <ListItemText>{t('auth.editProfile')}</ListItemText>
                            </MenuItem>

                            <Divider sx={{ my: 1 }} />

                            <MenuItem onClick={handleLogout} sx={{ color: 'error.main' }}>
                                <ListItemIcon>
                                    <LogoutIcon fontSize="small" sx={{ color: 'error.main' }} />
                                </ListItemIcon>
                                <ListItemText>{t('auth.logout')}</ListItemText>
                            </MenuItem>
                        </Menu>
                    </Box>
                </Box>
            </Toolbar>
        </AppBar>
    );
}
