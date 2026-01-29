import { ReactNode, useState } from 'react';
import { Box, useMediaQuery, Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { useTheme as useMuiTheme } from '@mui/material/styles';
import { Close as CloseIcon } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import Sidebar from './Sidebar';
import Header from './Header';
import ProfileEditForm from '../users/ProfileEditForm';
import { useAuthStore } from '@/store/auth';

interface LayoutProps {
    children: ReactNode;
}

const DRAWER_WIDTH = 280;

export default function Layout({ children }: LayoutProps) {
    const muiTheme = useMuiTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('lg'));
    const [sidebarOpen, setSidebarOpen] = useState(!isMobile);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const authStore = useAuthStore();
    const user = authStore.user;
    const { t } = useTranslation();

    const handleMenuClick = () => {
        setSidebarOpen((prev) => !prev);
    };

    const handleCloseSidebar = () => {
        if (isMobile) {
            setSidebarOpen(false);
        }
    };

    return (
        <Box
            sx={{
                display: 'flex',
                minHeight: '100vh',
                backgroundColor: 'background.default',
            }}
            data-testid="app-layout"
        >
            {/* Sidebar */}
            <Sidebar
                open={sidebarOpen}
                onClose={handleCloseSidebar}
                width={DRAWER_WIDTH}
                variant={isMobile ? 'temporary' : 'persistent'}
            />

            {/* Main Content Area */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    minHeight: '100vh',
                    width: { xs: '100%', lg: `calc(100% - ${sidebarOpen ? DRAWER_WIDTH : 0}px)` },
                    marginLeft: { xs: 0, lg: sidebarOpen ? 0 : `-${DRAWER_WIDTH}px` },
                    transition: (theme) =>
                        theme.transitions.create(['margin', 'width'], {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.leavingScreen,
                        }),
                }}
            >
                {/* Header */}
                <Header
                    onMenuClick={handleMenuClick}
                    onEditProfile={() => setIsProfileModalOpen(true)}
                    sidebarOpen={sidebarOpen}
                />

                {/* Page Content */}
                <Box
                    component="div"
                    data-testid="main-content"
                    sx={{
                        flexGrow: 1,
                        p: { xs: 2, sm: 3 },
                        overflow: 'auto',
                    }}
                >
                    <Box
                        sx={{
                            maxWidth: 1600,
                            mx: 'auto',
                            animation: 'fadeIn 0.4s ease-out',
                        }}
                    >
                        {children}
                    </Box>
                </Box>
            </Box>

            {/* Profile Edit Modal */}
            {user && (
                <Dialog
                    open={isProfileModalOpen}
                    onClose={() => setIsProfileModalOpen(false)}
                    maxWidth="sm"
                    fullWidth
                    disableEnforceFocus
                    disableAutoFocus
                    disableRestoreFocus
                    disablePortal
                    hideBackdrop={false}
                    PaperProps={{
                        sx: { borderRadius: 3 },
                    }}
                >
                    <DialogTitle
                        sx={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                        }}
                    >
                        {t('auth.editProfile')}
                        <IconButton
                            onClick={() => setIsProfileModalOpen(false)}
                            size="small"
                            sx={{ color: 'text.secondary' }}
                        >
                            <CloseIcon />
                        </IconButton>
                    </DialogTitle>
                    <DialogContent dividers>
                        <ProfileEditForm
                            user={user}
                            onSuccess={() => setIsProfileModalOpen(false)}
                            onCancel={() => setIsProfileModalOpen(false)}
                        />
                    </DialogContent>
                </Dialog>
            )}
        </Box>
    );
}
