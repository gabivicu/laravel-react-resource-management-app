import axios, { AxiosInstance, AxiosError } from 'axios';
import type { ApiResponse } from '@/types';

/**
 * Axios instance configurat pentru API-ul Laravel
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
        'Content-Type': 'application/json',
        'Accept': 'application/json',
    },
    withCredentials: true,
});

// Request interceptor pentru a adăuga tenant ID și token
api.interceptors.request.use(
    (config) => {
        const tenantId = localStorage.getItem('tenant_id');
        const token = localStorage.getItem('auth_token');

        if (tenantId) {
            config.headers['X-Tenant-ID'] = tenantId;
        }

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor pentru gestionarea erorilor
api.interceptors.response.use(
    (response) => response,
    (error: AxiosError<ApiResponse>) => {
        if (error.response?.status === 401) {
            // Unauthorized - redirect la login
            localStorage.removeItem('auth_token');
            localStorage.removeItem('tenant_id');
            window.location.href = '/login';
        }

        if (error.response?.status === 403) {
            // Forbidden - nu are permisiuni
            console.error('Access forbidden');
        }

        return Promise.reject(error);
    }
);

export default api;
