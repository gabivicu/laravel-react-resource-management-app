import { useState } from 'react';
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
    Grid,
} from '@mui/material';
import {
    Person as PersonIcon,
    Email as EmailIcon,
    Lock as LockIcon,
    Business as BusinessIcon,
    Visibility as VisibilityIcon,
    VisibilityOff as VisibilityOffIcon,
    PersonAdd as RegisterIcon,
} from '@mui/icons-material';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirmation, setPasswordConfirmation] = useState('');
    const [organizationName, setOrganizationName] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { register } = useAuthStore();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        try {
            await register({
                name,
                email,
                password,
                password_confirmation: passwordConfirmation,
                organization_name: organizationName,
            });
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
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
                    maxWidth: 480,
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
                        Create Account
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
                        Get started with Resource Management
                    </Typography>
                </Box>

                {/* Register Card */}
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
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                        {error}
                            </Alert>
                )}

                <form onSubmit={handleSubmit}>
                            <TextField
                                fullWidth
                                label="Full Name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                                autoComplete="name"
                                autoFocus
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <PersonIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                sx={{ mb: 2.5 }}
                            />

                            <TextField
                                fullWidth
                                label="Email Address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                                autoComplete="email"
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
                                label="Organization Name"
                            type="text"
                            value={organizationName}
                            onChange={(e) => setOrganizationName(e.target.value)}
                            required
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <BusinessIcon sx={{ color: 'text.secondary' }} />
                                        </InputAdornment>
                                    ),
                                }}
                                helperText="Your company or team name"
                                sx={{ mb: 2.5 }}
                            />

                            <Grid container spacing={2} sx={{ mb: 3 }}>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Password"
                                        type={showPassword ? 'text' : 'password'}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                                        autoComplete="new-password"
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
                                                        {showPassword ? (
                                                            <VisibilityOffIcon fontSize="small" />
                                                        ) : (
                                                            <VisibilityIcon fontSize="small" />
                                                        )}
                                                    </IconButton>
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                                <Grid size={{ xs: 12, sm: 6 }}>
                                    <TextField
                                        fullWidth
                                        label="Confirm Password"
                                        type={showPassword ? 'text' : 'password'}
                            value={passwordConfirmation}
                            onChange={(e) => setPasswordConfirmation(e.target.value)}
                            required
                                        autoComplete="new-password"
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LockIcon sx={{ color: 'text.secondary' }} />
                                                </InputAdornment>
                                            ),
                                        }}
                                    />
                                </Grid>
                            </Grid>

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
                                        <RegisterIcon />
                                    )
                                }
                                sx={{
                                    py: 1.5,
                                    fontSize: '1rem',
                                }}
                    >
                                {isLoading ? 'Creating account...' : 'Create Account'}
                            </Button>
                </form>

                        <Divider sx={{ my: 3 }}>
                            <Typography variant="body2" color="text.secondary">
                                or
                            </Typography>
                        </Divider>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="body2" color="text.secondary">
                        Already have an account?{' '}
                                <Typography
                                    component={Link}
                                    to="/login"
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
                                    Sign in
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
