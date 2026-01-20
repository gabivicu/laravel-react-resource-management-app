<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Multi-Tenancy Configuration
    |--------------------------------------------------------------------------
    |
    | Configurație pentru sistemul multi-tenant. Definește comportamentul
    | pentru izolarea datelor între organizații (tenants).
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Tenant Resolution Strategy
    |--------------------------------------------------------------------------
    |
    | Strategia folosită pentru identificarea tenant-ului curent:
    | - 'header': Din header-ul X-Tenant-ID
    | - 'domain': Din domeniul request-ului
    | - 'session': Din sesiune
    | - 'user': Din organizația curentă a utilizatorului autentificat
    |
    */

    'resolution_strategy' => env('TENANT_RESOLUTION_STRATEGY', 'header'),

    /*
    |--------------------------------------------------------------------------
    | Tenant Header Name
    |--------------------------------------------------------------------------
    |
    | Numele header-ului HTTP folosit pentru identificarea tenant-ului
    |
    */

    'header_name' => env('TENANT_HEADER_NAME', 'X-Tenant-ID'),

    /*
    |--------------------------------------------------------------------------
    | Require Tenant
    |--------------------------------------------------------------------------
    |
    | Dacă este true, toate request-urile trebuie să aibă un tenant setat.
    | Dacă este false, request-urile fără tenant sunt permise.
    |
    */

    'require_tenant' => env('REQUIRE_TENANT', true),

    /*
    |--------------------------------------------------------------------------
    | Tenant Column Name
    |--------------------------------------------------------------------------
    |
    | Numele coloanei folosită pentru identificarea tenant-ului în tabele
    |
    */

    'tenant_column' => 'organization_id',
];
