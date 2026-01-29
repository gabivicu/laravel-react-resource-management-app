import '../css/app.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import * as Sentry from '@sentry/react';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import App from './components/App';
import { TenantProvider } from './contexts/TenantContext';
import ErrorBoundary from './components/ErrorBoundary';
import { ThemeProvider } from './theme/ThemeContext';
import { setUnauthorizedCallback } from './services/api';
import { useAuthStore } from './store/auth';
import './i18n/config';
import './echo';

// Setup unauthorized callback to logout user
setUnauthorizedCallback(() => {
    useAuthStore.getState().logout();
});

// Initialize Sentry
const sentryDsn = import.meta.env.VITE_SENTRY_DSN;
const sentryEnvironment = import.meta.env.VITE_SENTRY_ENVIRONMENT || import.meta.env.MODE;

if (sentryDsn) {
    Sentry.init({
        dsn: sentryDsn,
        environment: sentryEnvironment,
        integrations: [
            Sentry.browserTracingIntegration(),
            Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
            }),
        ],
        // Performance Monitoring
        tracesSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        // Session Replay
        replaysSessionSampleRate: import.meta.env.PROD ? 0.1 : 1.0,
        replaysOnErrorSampleRate: 1.0,
    });
}

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

// Capture React Query errors
queryClient.setMutationDefaults(['*'], {
    onError: (error) => {
        if (sentryDsn) {
            Sentry.captureException(error);
        }
    },
});

const root = createRoot(document.getElementById('app')!);

root.render(
    <StrictMode>
        <ErrorBoundary>
            <ThemeProvider>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
            <QueryClientProvider client={queryClient}>
                <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                    <TenantProvider>
                        <App />
                        <ToastContainer
                            position="top-right"
                            autoClose={3000}
                            hideProgressBar={false}
                            newestOnTop={false}
                            closeOnClick
                            rtl={false}
                            pauseOnFocusLoss
                            draggable
                            pauseOnHover
                                theme="dark"
                                toastStyle={{
                                    backgroundColor: '#151921',
                                    color: '#F8FAFC',
                                    borderRadius: 12,
                                    border: '1px solid rgba(148, 163, 184, 0.12)',
                                }}
                        />
                    </TenantProvider>
                </BrowserRouter>
            </QueryClientProvider>
            </LocalizationProvider>
            </ThemeProvider>
        </ErrorBoundary>
    </StrictMode>
);
