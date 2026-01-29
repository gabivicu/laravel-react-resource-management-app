<?php

namespace App\Domains\Project\Policies;

use App\Domains\Project\Models\Project;
use App\Domains\User\Models\User;

class ProjectPolicy
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
     * Determine if the user can view any projects.
     */
    public function viewAny(User $user): bool
    {
        // Allow access if user has permission OR if user belongs to an organization
        return $this->hasPermission($user, 'projects.view')
            || $user->current_organization_id !== null;
    }

    /**
     * Determine if the user can view the project.
     */
    public function view(User $user, Project $project): bool
    {
        // Check if user belongs to the same organization
        if ($project->organization_id !== $user->current_organization_id) {
            return false;
        }

        // Check if user has view permission OR is a project member
        return $this->hasPermission($user, 'projects.view')
            || $project->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine if the user can create projects.
     */
    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'projects.create');
    }

    /**
     * Determine if the user can update the project.
     */
    public function update(User $user, Project $project): bool
    {
        // Check if user belongs to the same organization
        if ($project->organization_id !== $user->current_organization_id) {
            return false;
        }

        // Check if user has update permission OR is a project member (any role)
        // This allows any member of the project to update it, not just owners/managers
        return $this->hasPermission($user, 'projects.update')
            || $project->members()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine if the user can delete the project.
     */
    public function delete(User $user, Project $project): bool
    {
        // Check if user belongs to the same organization
        if ($project->organization_id !== $user->current_organization_id) {
            return false;
        }

        // Only users with delete permission can delete projects
        return $this->hasPermission($user, 'projects.delete');
    }

    /**
     * Determine if the user can manage project members.
     */
    public function manageMembers(User $user, Project $project): bool
    {
        // Check if user belongs to the same organization
        if ($project->organization_id !== $user->current_organization_id) {
            return false;
        }

        return $this->hasPermission($user, 'projects.manage_members')
            || $project->members()->where('user_id', $user->id)->wherePivot('role', 'owner')->exists();
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
