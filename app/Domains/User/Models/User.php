<?php

namespace App\Domains\User\Models;

use Database\Factories\UserFactory;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

/**
 * User Model
 *
 * Extended with multi-tenancy and RBAC functionality
 */
class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'current_organization_id', // Currently selected organization by the user
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    /**
     * Organizațiile cărora le aparține utilizatorul
     */
    public function organizations(): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Domains\Organization\Models\Organization::class,
            'organization_user',
            'user_id',
            'organization_id'
        )->withPivot(['role_id', 'joined_at'])
            ->withTimestamps();
    }

    /**
     * User roles in a specific organization
     */
    public function rolesInOrganization(int $organizationId): BelongsToMany
    {
        return $this->belongsToMany(
            \App\Domains\Permission\Models\Role::class,
            'organization_user',
            'user_id',
            'role_id'
        )->wherePivot('organization_id', $organizationId)
            ->withTimestamps();
    }

    /**
     * Check if the user has a specific role in an organization
     */
    public function hasRoleInOrganization(string $roleSlug, int $organizationId): bool
    {
        return $this->organizations()
            ->where('organizations.id', $organizationId)
            ->whereHas('users', function ($query) use ($roleSlug) {
                $query->whereHas('roles', function ($q) use ($roleSlug) {
                    $q->where('slug', $roleSlug);
                });
            })
            ->exists();
    }

    /**
     * Verifică dacă utilizatorul are o permisiune specifică într-o organizație
     */
    public function hasPermissionInOrganization(string $permission, int $organizationId): bool
    {
        return $this->organizations()
            ->where('organizations.id', $organizationId)
            ->whereHas('users', function ($query) use ($permission) {
                $query->whereHas('roles', function ($q) use ($permission) {
                    $q->whereHas('permissions', function ($p) use ($permission) {
                        $p->where('slug', $permission);
                    });
                });
            })
            ->exists();
    }

    /**
     * Get the current organization
     */
    public function currentOrganization(): BelongsTo
    {
        return $this->belongsTo(\App\Domains\Organization\Models\Organization::class, 'current_organization_id');
    }

    /**
     * Set the current organization
     */
    public function setCurrentOrganization(int $organizationId): bool
    {
        // Verify that the user belongs to the organization
        if (! $this->organizations()->where('organizations.id', $organizationId)->exists()) {
            return false;
        }

        $this->current_organization_id = $organizationId;

        return $this->save();
    }

    /**
     * Create a new factory instance for the model.
     */
    protected static function newFactory()
    {
        return UserFactory::new();
    }
}
