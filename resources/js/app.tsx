import '../css/app.css';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import App from './components/App';
import { TenantProvider } from './contexts/TenantContext';

const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            refetchOnWindowFocus: false,
            retry: 1,
            staleTime: 5 * 60 * 1000, // 5 minutes
        },
    },
});

const root = createRoot(document.getElementById('app')!);

root.render(
    <StrictMode>
        <QueryClientProvider client={queryClient}>
            <BrowserRouter future={{ v7_relativeSplatPath: true, v7_startTransition: true }}>
                <TenantProvider>
                    <App />
                </TenantProvider>
            </BrowserRouter>
        </QueryClientProvider>
    </StrictMode>
);
