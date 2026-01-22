<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Multi-Tenancy Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration for the multi-tenant system. Defines the behavior
    | for data isolation between organizations (tenants).
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Tenant Resolution Strategy
    |--------------------------------------------------------------------------
    |
    | Strategy used to identify the current tenant:
    | - 'header': From X-Tenant-ID header
    | - 'domain': From request domain
    | - 'session': From session
    | - 'user': From authenticated user's current organization
    |
    */

    'resolution_strategy' => env('TENANT_RESOLUTION_STRATEGY', 'header'),

    /*
    |--------------------------------------------------------------------------
    | Tenant Header Name
    |--------------------------------------------------------------------------
    |
    | HTTP header name used for tenant identification
    |
    */

    'header_name' => env('TENANT_HEADER_NAME', 'X-Tenant-ID'),

    /*
    |--------------------------------------------------------------------------
    | Require Tenant
    |--------------------------------------------------------------------------
    |
    | If true, all requests must have a tenant set.
    | If false, requests without tenant are allowed.
    |
    */

    'require_tenant' => env('REQUIRE_TENANT', true),

    /*
    |--------------------------------------------------------------------------
    | Tenant Column Name
    |--------------------------------------------------------------------------
    |
    | Column name used for tenant identification in tables
    |
    */

    'tenant_column' => 'organization_id',
];
