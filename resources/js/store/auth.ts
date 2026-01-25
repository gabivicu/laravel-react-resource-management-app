import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Organization } from '@/types';
import api from '@/services/api';

interface AuthState {
    user: User | null;
    currentOrganization: Organization | null;
    token: string | null;
    isAuthenticated: boolean;
    setUser: (user: User) => void;
    setToken: (token: string) => void;
    setCurrentOrganization: (organization: Organization) => void;
    login: (email: string, password: string) => Promise<void>;
    register: (data: any) => Promise<void>;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            currentOrganization: null,
            token: null,
            isAuthenticated: false,

            setUser: (user) => {
                set({ user, isAuthenticated: true });
                // Don't overwrite token - it should be set separately via setToken
                // Only update user in state, keep existing token
            },

            setToken: (token) => {
                set({ token });
                localStorage.setItem('auth_token', token);
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
            },

            setCurrentOrganization: (organization) => {
                set({ currentOrganization: organization });
                localStorage.setItem('tenant_id', organization.id.toString());
            },

            login: async (email: string, password: string) => {
                const response = await api.post<{ data: { user: User; token: string; organization: Organization } }>('/auth/login', {
                    email,
                    password,
                });

                const { user, token, organization } = response.data.data;

                // Save token to localStorage immediately
                localStorage.setItem('auth_token', token);
                if (organization) {
                    localStorage.setItem('tenant_id', organization.id.toString());
                }
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Update Zustand state
                set({
                    user,
                    token,
                    currentOrganization: organization,
                    isAuthenticated: true,
                });
            },

            register: async (data: any) => {
                const response = await api.post<{ data: { user: User; token: string; organization: Organization } }>('/auth/register', data);

                const { user, token, organization } = response.data.data;

                // Save token to localStorage immediately
                localStorage.setItem('auth_token', token);
                if (organization) {
                    localStorage.setItem('tenant_id', organization.id.toString());
                }
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                // Update Zustand state
                set({
                    user,
                    token,
                    currentOrganization: organization,
                    isAuthenticated: true,
                });
            },

            logout: () => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('tenant_id');
                delete api.defaults.headers.common['Authorization'];

                set({
                    user: null,
                    currentOrganization: null,
                    token: null,
                    isAuthenticated: false,
                });
            },
        }),
        {
            name: 'auth-storage',
            partialize: (state) => ({
                user: state.user,
                currentOrganization: state.currentOrganization,
                token: state.token,
                isAuthenticated: state.isAuthenticated,
            }),
        }
    )
);
