<?php

namespace App\Domains\Resource\Policies;

use App\Domains\Resource\Models\ResourceAllocation;
use App\Domains\User\Models\User;

class ResourceAllocationPolicy
{
    /**
     * Perform pre-authorization checks.
     */
    public function before(User $user, string $ability): ?bool
    {
        if ($user->isSuperAdmin()) {
            return true;
        }

        return null;
    }

    /**
     * Determine if the user can view any resource allocations.
     */
    public function viewAny(User $user): bool
    {
        // Allow access if user has permission OR if user belongs to an organization
        return $this->hasPermission($user, 'resources.view')
            || $user->current_organization_id !== null;
    }

    /**
     * Determine if the user can view the resource allocation.
     */
    public function view(User $user, ResourceAllocation $allocation): bool
    {
        // Check if user belongs to the same organization
        if ($allocation->organization_id !== $user->current_organization_id) {
            return false;
        }

        // Check if user has view permission OR is viewing their own allocation
        return $this->hasPermission($user, 'resources.view')
            || $allocation->user_id === $user->id;
    }

    /**
     * Determine if the user can create resource allocations.
     */
    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'resources.allocate');
    }

    /**
     * Determine if the user can update the resource allocation.
     */
    public function update(User $user, ResourceAllocation $allocation): bool
    {
        // Check if user belongs to the same organization
        if ($allocation->organization_id !== $user->current_organization_id) {
            return false;
        }

        // Users can always update their own allocations
        if ($allocation->user_id === $user->id) {
            return true;
        }

        // Otherwise, check if user has update permission
        return $this->hasPermission($user, 'resources.update_allocation');
    }

    /**
     * Determine if the user can delete the resource allocation.
     */
    public function delete(User $user, ResourceAllocation $allocation): bool
    {
        // Check if user belongs to the same organization
        if ($allocation->organization_id !== $user->current_organization_id) {
            return false;
        }

        return $this->hasPermission($user, 'resources.update_allocation');
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
