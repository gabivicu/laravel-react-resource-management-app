<?php

namespace App\Domains\User\Policies;

use App\Domains\User\Models\User;

class UserPolicy
{
    /**
     * Determine if the user can view any users.
     */
    public function viewAny(User $user): bool
    {
        return $this->hasPermission($user, 'users.view');
    }

    /**
     * Determine if the user can view the user.
     */
    public function view(User $user, User $model): bool
    {
        // Users can always view themselves
        if ($user->id === $model->id) {
            return true;
        }

        // Check if both users belong to the same organization
        $organizationId = $user->current_organization_id;
        if (! $organizationId) {
            return false;
        }

        if (! $model->organizations()->where('organizations.id', $organizationId)->exists()) {
            return false;
        }

        return $this->hasPermission($user, 'users.view');
    }

    /**
     * Determine if the user can create users.
     */
    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'users.invite');
    }

    /**
     * Determine if the user can update the user.
     */
    public function update(User $user, User $model): bool
    {
        // Users can always update themselves
        if ($user->id === $model->id) {
            return true;
        }

        // Check if both users belong to the same organization
        $organizationId = $user->current_organization_id;
        if (! $organizationId) {
            return false;
        }

        if (! $model->organizations()->where('organizations.id', $organizationId)->exists()) {
            return false;
        }

        return $this->hasPermission($user, 'users.update');
    }

    /**
     * Determine if the user can delete the user.
     */
    public function delete(User $user, User $model): bool
    {
        // Users cannot delete themselves
        if ($user->id === $model->id) {
            return false;
        }

        // Check if both users belong to the same organization
        $organizationId = $user->current_organization_id;
        if (! $organizationId) {
            return false;
        }

        if (! $model->organizations()->where('organizations.id', $organizationId)->exists()) {
            return false;
        }

        return $this->hasPermission($user, 'users.remove');
    }

    /**
     * Determine if the user can assign roles to another user.
     */
    public function assignRole(User $user, User $model): bool
    {
        // Check if both users belong to the same organization
        $organizationId = $user->current_organization_id;
        if (! $organizationId) {
            return false;
        }

        if (! $model->organizations()->where('organizations.id', $organizationId)->exists()) {
            return false;
        }

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
