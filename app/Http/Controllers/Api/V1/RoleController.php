<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Permission\Services\RoleService;
use Illuminate\Http\Request;

class RoleController extends BaseController
{
    public function __construct(
        protected RoleService $roleService
    ) {}

    /**
     * Display a listing of roles
     */
    public function index(Request $request)
    {
        $organizationId = $request->user()->current_organization_id;

        if (! $organizationId) {
            return $this->error('No organization selected', 400);
        }

        $roles = $this->roleService->getByOrganization($organizationId);

        return $this->success($roles, 'Roles retrieved successfully');
    }

    /**
     * Get all permissions
     */
    public function permissions()
    {
        $permissions = $this->roleService->getAllPermissions();

        return $this->success($permissions, 'Permissions retrieved successfully');
    }

    /**
     * Store a newly created role
     */
    public function store(Request $request)
    {
        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permission_ids' => ['nullable', 'array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
        ]);

        $organizationId = $request->user()->current_organization_id;

        if (! $organizationId) {
            return $this->error('No organization selected', 400);
        }

        $role = $this->roleService->create($request->only(['name', 'description', 'permission_ids']), $organizationId);

        return $this->success($role, 'Role created successfully', 201);
    }

    /**
     * Display the specified role
     */
    public function show(int $id)
    {
        $role = $this->roleService->find($id);

        if (! $role) {
            return $this->error('Role not found', 404);
        }

        return $this->success($role, 'Role retrieved successfully');
    }

    /**
     * Update the specified role
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'permission_ids' => ['nullable', 'array'],
            'permission_ids.*' => ['integer', 'exists:permissions,id'],
        ]);

        try {
            $role = $this->roleService->update($id, $request->only(['name', 'description', 'permission_ids']));

            return $this->success($role, 'Role updated successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }

    /**
     * Remove the specified role
     */
    public function destroy(int $id)
    {
        try {
            $deleted = $this->roleService->delete($id);

            if (! $deleted) {
                return $this->error('Failed to delete role', 500);
            }

            return $this->success(null, 'Role deleted successfully');
        } catch (\Exception $e) {
            return $this->error($e->getMessage(), 400);
        }
    }
}
