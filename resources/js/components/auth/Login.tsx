import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuthStore } from '@/store/auth';
import { Link, useNavigate } from 'react-router-dom';
import {
    Box,
    Card,
    CardContent,
    Typography,
    TextField,
    Button,
    Alert,
    InputAdornment,
    IconButton,
    Divider,
    CircularProgress,
} from '@mui/material';
import {
    Email as EmailIcon,
    Lock as LockIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    Login as LoginIcon,
} from '@mui/icons-material';

export default function Login() {
    const { t } = useTranslation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await login(email, password);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || t('auth.loginError'));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box
            sx={{
                minHeight: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                p: 2,
                background: (theme) =>
                    theme.palette.mode === 'dark'
                        ? `
                            radial-gradient(at 40% 20%, rgba(255, 193, 7, 0.08) 0px, transparent 50%),
                            radial-gradient(at 80% 0%, rgba(59, 130, 246, 0.05) 0px, transparent 50%),
                            radial-gradient(at 0% 50%, rgba(16, 185, 129, 0.05) 0px, transparent 50%),
                            linear-gradient(135deg, #0C0F14 0%, #151921 50%, #1E293B 100%)
                        `
                        : `
                            radial-gradient(at 40% 20%, rgba(255, 193, 7, 0.15) 0px, transparent 50%),
                            radial-gradient(at 80% 0%, rgba(59, 130, 246, 0.1) 0px, transparent 50%),
                            linear-gradient(135deg, #F8FAFC 0%, #E2E8F0 100%)
                        `,
            }}
        >
            <Box
                sx={{
                    width: '100%',
                    maxWidth: 440,
                    animation: 'fadeInUp 0.5s ease-out',
                }}
            >
                {/* Logo */}
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        mb: 4,
                    }}
                >
                    <Box
                        sx={{
                            width: 72,
                            height: 72,
                            borderRadius: 3,
                            background: 'linear-gradient(135deg, #FFC107 0%, #FF8F00 100%)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 12px 40px rgba(255, 193, 7, 0.35)',
                            mb: 2,
                        }}
                    >
                        <Typography variant="h4" fontWeight={800} sx={{ color: '#0F172A' }}>
                            RM
                        </Typography>
                    </Box>
                    <Typography variant="h4" fontWeight={700} color="text.primary">
                        Welcome back
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                        Sign in to your account to continue
                    </Typography>
                </Box>

                {/* Login Card */}
                <Card
                    sx={{
                        borderRadius: 4,
                        boxShadow: (theme) =>
                            theme.palette.mode === 'dark'
                                ? '0 24px 80px rgba(0, 0, 0, 0.5)'
                                : '0 24px 80px rgba(15, 23, 42, 0.12)',
                    }}
                >
                    <CardContent sx={{ p: 4 }}>
                {error && (
                            <Alert 
                                severity="error" 
                                sx={{ 
                                    mb: 3,
                                    borderRadius: 2,
                                }}
                            >
                        {error}
                            </Alert>
                )}

                <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                                autoComplete="email"
                                autoFocus
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <EmailIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 2.5 }}
                            />

                            <TextField
                                fullWidth
                                label={t('auth.password')}
                                type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                                autoComplete="current-password"
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <LockIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                    endAdornment: (
                                        <InputAdornment position="end">
                                            <IconButton
                                                onClick={() => setShowPassword(!showPassword)}
                                                edge="end"
                                                size="small"
                                            >
                                                {showPassword ? <VisibilityOffIcon /> : <VisibilityIcon />}
                                            </IconButton>
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 3 }}
                            />

                            <Button
                        type="submit"
                                fullWidth
                                variant="contained"
                                size="large"
                        disabled={isLoading}
                                startIcon={
                                    isLoading ? (
                                        <CircularProgress size={20} color="inherit" />
                                    ) : (
                                        <LoginIcon />
                                    )
                                }
                                sx={{
                                    py: 1.5,
                                    fontSize: '1rem',
                                }}
                    >
                        {isLoading ? t('auth.loggingIn') : t('auth.login')}
                            </Button>
                </form>

                        <Divider sx={{ my: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                or
                            </Typography>
                        </Divider>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                        {t('auth.dontHaveAccount')}{' '}
                                <Typography
                                    component={Link}
                                    to="/register"
                                    variant="body2"
                                    fontWeight={600}
                                    sx={{
                                        color: 'primary.main',
                                        textDecoration: 'none',
                                        '&:hover': {
                                            textDecoration: 'underline',
                                        },
                                    }}
                                >
                            {t('auth.register')}
                                </Typography>
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Footer */}
                <Box sx={{ textAlign: 'center', mt: 4 }}>
                    <Typography variant="caption" color="text.secondary">
                        © 2024 Resource Management. All rights reserved.
                    </Typography>
                </Box>
            </Box>
        </Box>
    );
}
