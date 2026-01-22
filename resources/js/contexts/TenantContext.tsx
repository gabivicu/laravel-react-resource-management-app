import { ReactNode, useState, useEffect } from 'react';
import type { Organization } from '@/types';
import { useAuthStore } from '@/store/auth';
import api from '@/services/api';
import { TenantContext } from './TenantContext';

export function TenantProvider({ children }: { children: ReactNode }) {
    const { currentOrganization, setCurrentOrganization } = useAuthStore();
    const [currentTenant, setCurrentTenant] = useState<Organization | null>(currentOrganization);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (currentOrganization) {
            setCurrentTenant(currentOrganization);
            localStorage.setItem('tenant_id', currentOrganization.id.toString());
        }
    }, [currentOrganization]);

    const setTenant = async (tenantId: number) => {
        setIsLoading(true);
        try {
            const response = await api.get<{ data: Organization }>(`/organizations/${tenantId}`);
            const organization = response.data.data;

            setCurrentTenant(organization);
            setCurrentOrganization(organization);
            localStorage.setItem('tenant_id', tenantId.toString());
        } catch (error) {
            console.error('Failed to set tenant:', error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TenantContext.Provider value={{ currentTenant, setTenant, isLoading }}>
            {children}
        </TenantContext.Provider>
    );
}

