<?php

namespace App\Core\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

/**
 * Middleware for managing the current tenant
 * 
 * This middleware sets the current tenant in session and request,
 * based on the X-Tenant-ID header or the authenticated user's organization.
 */
class TenantScopeMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $tenantId = $this->resolveTenantId($request);

        if ($tenantId) {
            // Set tenant in request to be accessible in the application
            $request->merge(['organization_id' => $tenantId]);
            $request->headers->set('X-Tenant-ID', $tenantId);
            
            // Set in session for persistence
            session(['tenant_id' => $tenantId]);
        }

        return $next($request);
    }

    /**
     * Resolve tenant ID from request or authenticated user
     */
    protected function resolveTenantId(Request $request): ?int
    {
        // 1. Check X-Tenant-ID header
        if ($tenantId = $request->header('X-Tenant-ID')) {
            return $this->validateTenantAccess($tenantId) ? (int) $tenantId : null;
        }

        // 2. Check query/body parameter
        if ($tenantId = $request->input('organization_id')) {
            return $this->validateTenantAccess($tenantId) ? (int) $tenantId : null;
        }

        // 3. Check session
        if ($tenantId = session('tenant_id')) {
            return $this->validateTenantAccess($tenantId) ? (int) $tenantId : null;
        }

        // 4. If user is authenticated, use their current organization
        if (Auth::check()) {
            $user = Auth::user();
            $tenantId = $user->current_organization_id ?? $user->organizations()->first()?->id;
            
            if ($tenantId && $this->validateTenantAccess($tenantId)) {
                return (int) $tenantId;
            }
        }

        return null;
    }

    /**
     * Validate that the authenticated user has access to the specified tenant
     */
    protected function validateTenantAccess($tenantId): bool
    {
        if (!Auth::check()) {
            return false;
        }

        $user = Auth::user();
        
        // Check if user belongs to the organization
        return $user->organizations()->where('organizations.id', $tenantId)->exists();
    }
}
