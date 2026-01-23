<?php

namespace App\Domains\Task\Policies;

use App\Domains\Task\Models\Task;
use App\Domains\User\Models\User;

class TaskPolicy
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
     * Determine if the user can view any tasks.
     */
    public function viewAny(User $user): bool
    {
        // Allow access if user has permission OR if user belongs to an organization
        return $this->hasPermission($user, 'tasks.view')
            || $user->current_organization_id !== null;
    }

    /**
     * Determine if the user can view the task.
     */
    public function view(User $user, Task $task): bool
    {
        // Check if user belongs to the same organization
        if ($task->organization_id !== $user->current_organization_id) {
            return false;
        }

        // Check if user has view permission OR is assigned to the task OR is project member
        return $this->hasPermission($user, 'tasks.view')
            || $task->assignees()->where('user_id', $user->id)->exists()
            || ($task->project && $task->project->members()->where('user_id', $user->id)->exists());
    }

    /**
     * Determine if the user can create tasks.
     */
    public function create(User $user): bool
    {
        return $this->hasPermission($user, 'tasks.create');
    }

    /**
     * Determine if the user can update the task.
     */
    public function update(User $user, Task $task): bool
    {
        // Check if user belongs to the same organization
        if ($task->organization_id !== $user->current_organization_id) {
            return false;
        }

        // Check if user has update permission OR is assigned to the task
        return $this->hasPermission($user, 'tasks.update')
            || $task->assignees()->where('user_id', $user->id)->exists();
    }

    /**
     * Determine if the user can delete the task.
     */
    public function delete(User $user, Task $task): bool
    {
        // Check if user belongs to the same organization
        if ($task->organization_id !== $user->current_organization_id) {
            return false;
        }

        // Only users with delete permission can delete tasks
        return $this->hasPermission($user, 'tasks.delete');
    }

    /**
     * Determine if the user can assign tasks.
     */
    public function assign(User $user, Task $task): bool
    {
        // Check if user belongs to the same organization
        if ($task->organization_id !== $user->current_organization_id) {
            return false;
        }

        return $this->hasPermission($user, 'tasks.assign');
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
