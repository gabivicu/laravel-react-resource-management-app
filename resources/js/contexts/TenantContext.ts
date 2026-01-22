import { createContext } from 'react';
import type { Organization } from '@/types';

export interface TenantContextType {
    currentTenant: Organization | null;
    setTenant: (tenantId: number) => Promise<void>;
    isLoading: boolean;
}

export const TenantContext = createContext<TenantContextType | undefined>(undefined);

// Re-export TenantProvider from .tsx file
export { TenantProvider } from './TenantContext.tsx';
