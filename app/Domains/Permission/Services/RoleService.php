<?php

namespace App\Domains\Permission\Services;

use App\Domains\Organization\Models\Organization;
use App\Domains\Permission\Models\Permission;
use App\Domains\Permission\Models\Role;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

class RoleService
{
    /**
     * Get all roles for organization
     * Returns both organization-specific roles and global roles (where organization_id is null)
     */
    public function getByOrganization(int $organizationId): Collection
    {
        return Role::where(function ($query) use ($organizationId) {
            $query->where('organization_id', $organizationId)
                ->orWhereNull('organization_id'); // Include global roles
        })
            ->with('permissions')
            ->orderBy('name')
            ->get();
    }

    /**
     * Get role by ID
     */
    public function find(int $id): ?Role
    {
        return Role::with('permissions')->find($id);
    }

    /**
     * Create a new role
     */
    public function create(array $data, int $organizationId): Role
    {
        return DB::transaction(function () use ($data, $organizationId) {
            $role = Role::create([
                'name' => $data['name'],
                'slug' => \Illuminate\Support\Str::slug($data['name']),
                'description' => $data['description'] ?? null,
                'is_system' => false,
                'organization_id' => $organizationId,
            ]);

            // Attach permissions if provided
            if (isset($data['permission_ids']) && is_array($data['permission_ids'])) {
                $role->permissions()->sync($data['permission_ids']);
            }

            return $role->load('permissions');
        });
    }

    /**
     * Update role
     */
    public function update(int $id, array $data): Role
    {
        $role = Role::findOrFail($id);

        // Don't allow updating system roles
        if ($role->is_system) {
            throw new \Exception('Cannot update system roles');
        }

        $role->update([
            'name' => $data['name'] ?? $role->name,
            'slug' => isset($data['name']) ? \Illuminate\Support\Str::slug($data['name']) : $role->slug,
            'description' => $data['description'] ?? $role->description,
        ]);

        // Update permissions if provided
        if (isset($data['permission_ids']) && is_array($data['permission_ids'])) {
            $role->permissions()->sync($data['permission_ids']);
        }

        return $role->load('permissions');
    }

    /**
     * Delete role
     */
    public function delete(int $id): bool
    {
        $role = Role::findOrFail($id);

        // Don't allow deleting system roles
        if ($role->is_system) {
            throw new \Exception('Cannot delete system roles');
        }

        return $role->delete();
    }

    /**
     * Get all permissions
     */
    public function getAllPermissions(): Collection
    {
        return Permission::orderBy('group')->orderBy('name')->get();
    }
}
