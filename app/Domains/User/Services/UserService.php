<?php

namespace App\Domains\User\Services;

use App\Domains\Organization\Models\Organization;
use App\Domains\User\Models\User;
use Illuminate\Http\UploadedFile;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;

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
                $q->where('name', 'like', '%'.$filters['search'].'%')
                    ->orWhere('email', 'like', '%'.$filters['search'].'%');
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

        if (isset($data['avatar'])) {
            $updateData['avatar'] = $data['avatar'];
        }

        $user->update($updateData);

        return $user->load(['organizations']);
    }

    /**
     * Upload avatar for user
     */
    public function uploadAvatar(int $userId, UploadedFile $file): string
    {
        $user = User::findOrFail($userId);

        // Delete old avatar if exists
        if ($user->avatar) {
            $this->removeAvatar($userId);
        }

        // Generate unique filename
        $filename = 'avatars/'.$userId.'_'.time().'.'.$file->getClientOriginalExtension();

        // Store file in public disk
        $path = $file->storeAs('avatars', $userId.'_'.time().'.'.$file->getClientOriginalExtension(), 'public');

        // Get public URL
        $relativeUrl = Storage::disk('public')->url($path);

        // Make URL absolute if it's relative
        $url = $relativeUrl;
        if (! str_starts_with($url, 'http')) {
            $appUrl = rtrim(config('app.url'), '/');
            $url = $appUrl.$relativeUrl;
        }

        // Update user avatar
        $user->update(['avatar' => $url]);

        return $url;
    }

    /**
     * Remove avatar for user
     */
    public function removeAvatar(int $userId): void
    {
        $user = User::findOrFail($userId);

        if ($user->avatar) {
            // Extract filename from URL (remove /storage/ prefix and any query params)
            $urlPath = parse_url($user->avatar, PHP_URL_PATH);
            $filename = str_replace('/storage/', '', $urlPath);

            // Delete file from storage
            if ($filename && Storage::disk('public')->exists($filename)) {
                Storage::disk('public')->delete($filename);
            }

            // Clear avatar from user
            $user->update(['avatar' => null]);
        }
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
