import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse } from '@/types';

/**
 * Axios instance configured for Laravel API
 */
// Use relative URL to avoid CORS issues when frontend and backend are on same origin
// If VITE_API_URL is set to absolute URL, it will be used; otherwise use relative path
const getBaseURL = (): string => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl && envUrl.startsWith('http')) {
        return envUrl;
    }
    // Use relative URL to match current origin
    return '/api/v1';
};

const api: AxiosInstance = axios.create({
    baseURL: getBaseURL(),
    headers: {
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor to add tenant ID, token, and language
api.interceptors.request.use(
    (config) => {
        const tenantId = localStorage.getItem('tenant_id');
        const token = localStorage.getItem('auth_token');
        const language = localStorage.getItem('i18nextLng') || 'en';

        // Only set Content-Type for non-FormData requests
        // For FormData, let browser set it automatically with boundary
        if (!(config.data instanceof FormData)) {
            if (!config.headers['Content-Type']) {
                config.headers['Content-Type'] = 'application/json';
            }
        } else {
            // For FormData, explicitly delete Content-Type to let browser set it
            delete config.headers['Content-Type'];
        }

        if (tenantId) {
            config.headers['X-Tenant-ID'] = tenantId;
        }

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        // Add language to request header
        config.headers['Accept-Language'] = language;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

let onUnauthorized: (() => void) | null = null;

export const setUnauthorizedCallback = (callback: () => void) => {
    onUnauthorized = callback;
};

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
            // Check if this is a request that should not trigger auto-logout
            const requestUrl = error.config?.url || '';
            const isAuthRequest = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/register');
            
            // Don't auto-logout for auth requests
            if (isAuthRequest) {
                return Promise.reject(error);
            }
            
            // For other 401 errors, check if token exists and is valid
            const currentToken = localStorage.getItem('auth_token');
            
            // If no token exists, user is already logged out - don't do anything
            if (!currentToken) {
                return Promise.reject(error);
            }
            
            // Token exists but request returned 401 - likely expired or invalid
            console.warn('Session expired or invalid, logging out...');
            
            // Trigger the unauthorized callback if registered
            if (onUnauthorized) {
                onUnauthorized();
            }
            
            return Promise.reject(error);
        }

        if (error.response?.status === 403) {
            // Forbidden - user does not have permissions
            console.error('Access forbidden');
        }

        return Promise.reject(error);
    }
);

export default api;
