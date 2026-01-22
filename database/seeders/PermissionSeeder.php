<?php

namespace Database\Seeders;

use App\Domains\Permission\Models\Permission;
use App\Domains\Permission\Models\Role;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = config('permissions.default_permissions');
        $permissionGroups = config('permissions.permission_groups');

        // Create permissions
        foreach ($permissions as $permissionSlug) {
            $group = explode('.', $permissionSlug)[0];
            $groupName = $permissionGroups[$group] ?? ucfirst($group);

            Permission::firstOrCreate(
                ['slug' => $permissionSlug],
                [
                    'name' => $this->formatPermissionName($permissionSlug),
                    'description' => "Permission to {$this->formatPermissionName($permissionSlug)}",
                    'group' => $group,
                ]
            );
        }

        // Create global roles (without organization)
        $this->createGlobalRoles();

        $this->command->info('Permissions and roles seeded successfully.');
    }

    /**
     * Create global roles
     */
    protected function createGlobalRoles(): void
    {
        $defaultRoles = config('permissions.default_roles');

        foreach ($defaultRoles as $roleKey => $roleData) {
            $role = Role::firstOrCreate(
                ['slug' => $roleData['slug'], 'organization_id' => null],
                [
                    'name' => $roleData['name'],
                    'description' => $roleData['description'],
                    'is_system' => $roleData['is_system'],
                ]
            );

            // Assign permissions based on role
            $this->assignPermissionsToRole($role, $roleKey);
        }
    }

    /**
     * Assign permissions to a role based on role type
     */
    protected function assignPermissionsToRole(Role $role, string $roleKey): void
    {
        $permissions = Permission::all();

        switch ($roleKey) {
            case 'admin':
                // Admin has all permissions
                $role->permissions()->sync($permissions->pluck('id'));
                break;

            case 'project_manager':
                // Project Manager can manage projects, tasks and resources
                $allowedPermissions = $permissions->filter(function ($permission) {
                    return str_starts_with($permission->slug, 'projects.')
                        || str_starts_with($permission->slug, 'tasks.')
                        || str_starts_with($permission->slug, 'resources.')
                        || str_starts_with($permission->slug, 'users.view');
                });
                $role->permissions()->sync($allowedPermissions->pluck('id'));
                break;

            case 'developer':
                // Developer can view and work on tasks
                $allowedPermissions = $permissions->filter(function ($permission) {
                    return str_starts_with($permission->slug, 'tasks.view')
                        || str_starts_with($permission->slug, 'tasks.update')
                        || str_starts_with($permission->slug, 'projects.view');
                });
                $role->permissions()->sync($allowedPermissions->pluck('id'));
                break;
        }
    }

    /**
     * Format permission name for display
     */
    protected function formatPermissionName(string $slug): string
    {
        return ucwords(str_replace('.', ' ', $slug));
    }
}
