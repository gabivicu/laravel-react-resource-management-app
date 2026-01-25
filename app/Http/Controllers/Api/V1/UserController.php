<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\User\Services\UserService;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class UserController extends BaseController
{
    public function __construct(
        protected UserService $userService
    ) {}

    /**
     * Display a listing of users
     */
    public function index(Request $request)
    {
        $organizationId = $request->user()->current_organization_id;

        if (! $organizationId) {
            return $this->error('No organization selected', 400);
        }

        $filters = $request->only(['search']);
        $perPage = $request->get('per_page', 15);

        $users = $this->userService->getPaginated($organizationId, $filters, $perPage);

        return $this->success($users->items(), 'Users retrieved successfully', 200, [
            'pagination' => [
                'current_page' => $users->currentPage(),
                'last_page' => $users->lastPage(),
                'per_page' => $users->perPage(),
                'total' => $users->total(),
            ],
        ]);
    }

    /**
     * Display the specified user
     */
    public function show(int $id)
    {
        $user = $this->userService->find($id);

        if (! $user) {
            return $this->error('User not found', 404);
        }

        return $this->success($user, 'User retrieved successfully');
    }

    /**
     * Update the specified user
     */
    public function update(Request $request, int $id)
    {
        $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255'],
            'email' => ['sometimes', 'required', 'email', 'unique:users,email,'.$id],
            'password' => ['sometimes', 'nullable', 'string', 'min:8'],
            'avatar' => ['sometimes', 'nullable', 'image', 'mimes:jpeg,png,jpg,gif', 'max:5120'], // 5MB max
        ]);

        $data = $request->only(['name', 'email', 'password']);

        // Handle avatar upload if present
        if ($request->hasFile('avatar')) {
            $data['avatar'] = $this->userService->uploadAvatar($id, $request->file('avatar'));
        } elseif ($request->has('avatar') && $request->input('avatar') === null) {
            // Remove avatar if explicitly set to null
            $data['avatar'] = null;
        }

        $user = $this->userService->update($id, $data);

        return $this->success($user, 'User updated successfully');
    }

    /**
     * Upload avatar for the authenticated user
     */
    public function uploadAvatar(Request $request)
    {
        $request->validate([
            'avatar' => ['required', 'image', 'mimes:jpeg,png,jpg,gif', 'max:5120'], // 5MB max
        ]);

        $user = $request->user();
        $this->userService->uploadAvatar($user->id, $request->file('avatar'));

        $user = $this->userService->find($user->id);

        return $this->success(new UserResource($user), 'Avatar uploaded successfully');
    }

    /**
     * Remove avatar for the authenticated user
     */
    public function removeAvatar(Request $request)
    {
        $user = $request->user();
        $this->userService->removeAvatar($user->id);

        $user = $this->userService->find($user->id);

        return $this->success(new UserResource($user), 'Avatar removed successfully');
    }

    /**
     * Assign role to user
     */
    public function assignRole(Request $request, int $id)
    {
        $request->validate([
            'role_id' => ['required', 'integer', 'exists:roles,id'],
        ]);

        $organizationId = $request->user()->current_organization_id;

        if (! $organizationId) {
            return $this->error('No organization selected', 400);
        }

        $this->userService->assignRole($id, $organizationId, $request->input('role_id'));

        return $this->success(null, 'Role assigned successfully');
    }

    /**
     * Remove role from user
     */
    public function removeRole(Request $request, int $id)
    {
        $organizationId = $request->user()->current_organization_id;

        if (! $organizationId) {
            return $this->error('No organization selected', 400);
        }

        $this->userService->removeRole($id, $organizationId);

        return $this->success(null, 'Role removed successfully');
    }
}
