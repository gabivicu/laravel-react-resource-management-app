<?php

namespace App\Core\Traits;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Auth;

/**
 * Trait for automatically applying tenant scope to models
 *
 * This trait ensures that all queries for models that use it
 * are automatically filtered by the current organization (tenant).
 */
trait HasTenantScope
{
    /**
     * Boot the trait
     */
    protected static function bootHasTenantScope(): void
    {
        // Apply global scope for all queries
        static::addGlobalScope('tenant', function (Builder $builder) {
            $tenantId = static::getCurrentTenantId();

            if ($tenantId) {
                $builder->where($builder->getModel()->getTable().'.organization_id', $tenantId);
            }
        });

        // Ensure organization is automatically set on creation
        static::creating(function (Model $model) {
            if (! isset($model->organization_id)) {
                $tenantId = static::getCurrentTenantId();
                if ($tenantId) {
                    $model->organization_id = $tenantId;
                }
            }
        });
    }

    /**
     * Obține ID-ul tenant-ului curent
     */
    protected static function getCurrentTenantId(): ?int
    {
        // Încearcă să obțină din request (setat de middleware)
        $tenantId = request()->header('X-Tenant-ID')
            ?? request()->input('organization_id')
            ?? session('tenant_id');

        // Dacă nu există în request, încearcă din user autentificat
        if (! $tenantId && Auth::check()) {
            $user = Auth::user();
            $tenantId = $user->current_organization_id ?? $user->organizations()->first()?->id;
        }

        return $tenantId ? (int) $tenantId : null;
    }

    /**
     * Query without tenant scope (for admin or special cases)
     */
    public static function withoutTenantScope(): Builder
    {
        return static::withoutGlobalScope('tenant');
    }

    /**
     * Query for a specific tenant
     */
    public static function forTenant(int $tenantId): Builder
    {
        return static::withoutTenantScope()->where('organization_id', $tenantId);
    }
}
