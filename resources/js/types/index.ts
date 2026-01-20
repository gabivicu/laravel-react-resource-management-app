/**
 * TypeScript types pentru aplicație
 */

export interface User {
    id: number;
    name: string;
    email: string;
    current_organization_id?: number;
    created_at: string;
    updated_at: string;
}

export interface Organization {
    id: number;
    name: string;
    slug: string;
    domain?: string;
    is_active: boolean;
    settings?: Record<string, any>;
    created_at: string;
    updated_at: string;
}

export interface Role {
    id: number;
    name: string;
    slug: string;
    description?: string;
    is_system: boolean;
    organization_id?: number;
    permissions?: Permission[];
}

export interface Permission {
    id: number;
    name: string;
    slug: string;
    description?: string;
    group?: string;
}

export interface Project {
    id: number;
    organization_id: number;
    name: string;
    description?: string;
    status: 'planning' | 'active' | 'on_hold' | 'completed' | 'cancelled';
    start_date?: string;
    end_date?: string;
    budget?: number;
    settings?: Record<string, any>;
    created_at: string;
    updated_at: string;
    members?: ProjectMember[];
    tasks?: Task[];
}

export interface ProjectMember {
    id: number;
    name: string;
    email: string;
    pivot: {
        role: string;
        joined_at: string;
    };
}

export interface Task {
    id: number;
    organization_id: number;
    project_id: number;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'review' | 'done';
    priority: 'low' | 'medium' | 'high' | 'urgent';
    due_date?: string;
    estimated_hours?: number;
    actual_hours?: number;
    order: number;
    created_at: string;
    updated_at: string;
    project?: Project;
    assignees?: User[];
}

export interface ResourceAllocation {
    id: number;
    organization_id: number;
    project_id: number;
    user_id: number;
    role?: string;
    allocation_percentage: number;
    start_date: string;
    end_date?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    project?: Project;
    user?: User;
}

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    errors?: Record<string, string[]>;
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}
