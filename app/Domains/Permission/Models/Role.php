<?php

namespace App\Domains\Permission\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * Role Model
 * 
 * Roles define sets of permissions (e.g., Admin, Project Manager, Developer)
 */
class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
        'is_system', // System roles that cannot be deleted/modified
        'organization_id', // Null for global roles, or ID for organization-specific roles
    ];

    protected $casts = [
        'is_system' => 'boolean',
    ];

    /**
     * Permisiunile asociate acestui rol
     */
    public function permissions(): BelongsToMany
    {
        return $this->belongsToMany(
            Permission::class,
            'role_permission',
            'role_id',
            'permission_id'
        )->withTimestamps();
    }

    /**
     * Users that have this role
     */
    public function users(): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Domains\User\Models\User::class,
            'organization_user',
            'role_id',
            'user_id'
        )->withPivot('organization_id')
          ->withTimestamps();
    }

    /**
     * Verifică dacă rolul are o permisiune specifică
     */
    public function hasPermission(string $permission): bool
    {
        return $this->permissions()->where('slug', $permission)->exists();
    }

    /**
     * Assign permissions to the role
     */
    public function assignPermissions(array $permissionIds): void
    {
        $this->permissions()->sync($permissionIds);
    }

    /**
     * Scope pentru roluri globale (fără organizație)
     */
    public function scopeGlobal($query)
    {
        return $query->whereNull('organization_id');
    }

    /**
     * Scope for organization-specific roles
     */
    public function scopeForOrganization($query, int $organizationId)
    {
        return $query->where('organization_id', $organizationId);
    }
}
