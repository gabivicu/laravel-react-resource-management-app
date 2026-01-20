<?php

namespace App\Domains\User\Services;

use App\Domains\User\Models\User;
use App\Domains\Organization\Models\Organization;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;

class UserService
{
    /**
     * Get paginated users
     */
    public function getPaginated(int $organizationId, array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        $query = User::whereHas('organizations', function ($q) use ($organizationId) {
            $q->where('organizations.id', $organizationId);
        });

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('email', 'like', '%' . $filters['search'] . '%');
            });
        }

        return $query->with(['organizations'])->paginate($perPage);
    }

    /**
     * Get user by ID
     */
    public function find(int $id): ?User
    {
        return User::with(['organizations', 'currentOrganization'])->find($id);
    }

    /**
     * Create a new user
     */
    public function create(array $data, int $organizationId): User
    {
        return DB::transaction(function () use ($data, $organizationId) {
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            // Attach to organization
            $organization = Organization::findOrFail($organizationId);
            $organization->users()->attach($user->id);

            return $user->load(['organizations']);
        });
    }

    /**
     * Update user
     */
    public function update(int $id, array $data): User
    {
        $user = User::findOrFail($id);

        $updateData = [
            'name' => $data['name'] ?? $user->name,
            'email' => $data['email'] ?? $user->email,
        ];

        if (isset($data['password'])) {
            $updateData['password'] = Hash::make($data['password']);
        }

        $user->update($updateData);

        return $user->load(['organizations']);
    }

    /**
     * Delete user
     */
    public function delete(int $id): bool
    {
        $user = User::findOrFail($id);
        return $user->delete();
    }

    /**
     * Assign role to user in organization
     */
    public function assignRole(int $userId, int $organizationId, int $roleId): void
    {
        $user = User::findOrFail($userId);
        $organization = Organization::findOrFail($organizationId);

        $organization->users()->updateExistingPivot($user->id, [
            'role_id' => $roleId,
        ]);
    }

    /**
     * Remove role from user in organization
     */
    public function removeRole(int $userId, int $organizationId): void
    {
        $user = User::findOrFail($userId);
        $organization = Organization::findOrFail($organizationId);

        $organization->users()->updateExistingPivot($user->id, [
            'role_id' => null,
        ]);
    }
}
