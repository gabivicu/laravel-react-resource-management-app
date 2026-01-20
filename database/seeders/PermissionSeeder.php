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

        // Creează permisiunile
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

        // Creează rolurile globale (fără organizație)
        $this->createGlobalRoles();

        $this->command->info('Permissions and roles seeded successfully.');
    }

    /**
     * Creează rolurile globale
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

            // Atribuie permisiuni bazate pe rol
            $this->assignPermissionsToRole($role, $roleKey);
        }
    }

    /**
     * Atribuie permisiuni unui rol bazat pe tipul de rol
     */
    protected function assignPermissionsToRole(Role $role, string $roleKey): void
    {
        $permissions = Permission::all();

        switch ($roleKey) {
            case 'admin':
                // Admin are toate permisiunile
                $role->permissions()->sync($permissions->pluck('id'));
                break;

            case 'project_manager':
                // Project Manager poate gestiona proiecte, task-uri și resurse
                $allowedPermissions = $permissions->filter(function ($permission) {
                    return str_starts_with($permission->slug, 'projects.')
                        || str_starts_with($permission->slug, 'tasks.')
                        || str_starts_with($permission->slug, 'resources.')
                        || str_starts_with($permission->slug, 'users.view');
                });
                $role->permissions()->sync($allowedPermissions->pluck('id'));
                break;

            case 'developer':
                // Developer poate vedea și lucra la task-uri
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
     * Formatează numele permisiunii pentru afișare
     */
    protected function formatPermissionName(string $slug): string
    {
        return ucwords(str_replace('.', ' ', $slug));
    }
}
