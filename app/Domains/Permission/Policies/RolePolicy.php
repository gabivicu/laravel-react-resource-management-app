<?php

namespace App\Domains\Permission\Policies;

use App\Domains\Permission\Models\Role;
use App\Domains\User\Models\User;

class RolePolicy
{
    /**
     * Determine if the user can view any roles.
     */
    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'roles.view');
    }

    /**
     * Determine if the user can view the role.
     */
    public function view(User $user, Role $role): bool
    {
        // Check if role belongs to the same organization (or is global)
        $organizationId = $user->current_organization_id;
        if (! $organizationId) {
            return false;
        }

        if ($role->organization_id !== null && $role->organization_id !== $organizationId) {
            return false;
        }

        return $this->hasPermission($user, 'roles.view');
    }

    /**
     * Determine if the user can create roles.
     */
    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'roles.create');
    }

    /**
     * Determine if the user can update the role.
     */
    public function update(User $user, Role $role): bool
    {
        // System roles cannot be modified
        if ($role->is_system) {
            return false;
        }

        // Check if role belongs to the same organization (or is global)
        $organizationId = $user->current_organization_id;
        if (! $organizationId) {
            return false;
        }

        if ($role->organization_id !== null && $role->organization_id !== $organizationId) {
            return false;
        }

        return $this->hasPermission($user, 'roles.update');
    }

    /**
     * Determine if the user can delete the role.
     */
    public function delete(User $user, Role $role): bool
    {
        // System roles cannot be deleted
        if ($role->is_system) {
            return false;
        }

        // Check if role belongs to the same organization (or is global)
        $organizationId = $user->current_organization_id;
        if (! $organizationId) {
            return false;
        }

        if ($role->organization_id !== null && $role->organization_id !== $organizationId) {
            return false;
        }

        return $this->hasPermission($user, 'roles.delete');
    }

    /**
     * Determine if the user can assign roles to users.
     */
    public function assign(User $user): bool
    {
        return $this->hasPermission($user, 'roles.assign');
    }

    /**
     * Check if user has a specific permission in current organization
     */
    protected function hasPermission(User $user, string $permission): bool
    {
        $organizationId = $user->current_organization_id;

        if (! $organizationId) {
            return false;
        }

        return $user->hasPermissionInOrganization($permission, $organizationId);
    }
}
