<?php

namespace App\Domains\Auth\Services;

use App\Domains\Organization\Models\Organization;
use App\Domains\User\Models\User;
use App\Domains\Permission\Models\Role;
use App\Domains\Permission\Models\Permission;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class AuthService
{
    /**
     * Register a new user and create their organization
     */
    public function register(array $data): array
    {
        return DB::transaction(function () use ($data) {
            // 1. Create User
            $user = User::create([
                'name' => $data['name'],
                'email' => $data['email'],
                'password' => Hash::make($data['password']),
            ]);

            // 2. Create Organization
            $organization = Organization::create([
                'name' => $data['organization_name'],
                'slug' => \Illuminate\Support\Str::slug($data['organization_name']) . '-' . uniqid(),
                'is_active' => true,
            ]);

            // 3. Create Owner Role for this Organization
            $ownerRole = $this->createOwnerRole($organization);

            // 4. Attach User to Organization with Owner Role
            $user->current_organization_id = $organization->id;
            $user->save();
            $organization->users()->attach($user->id, ['role_id' => $ownerRole->id]);

            // 5. Generate Token
            $token = $user->createToken('auth_token')->plainTextToken;

            return [
                'user' => $user,
                'organization' => $organization,
                'token' => $token,
            ];
        });
    }

    /**
     * Authenticate user and return token
     */
    public function login(string $email, string $password): array
    {
        $user = User::where('email', $email)->first();

        if (! $user || ! Hash::check($password, $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Invalid credentials.'],
            ]);
        }

        // Ensure user has a current organization set if they belong to any
        if (!$user->current_organization_id) {
            $org = $user->organizations()->first();
            if ($org) {
                $user->current_organization_id = $org->id;
                $user->save();
            }
        }

        $token = $user->createToken('auth_token')->plainTextToken;
        $organization = $user->currentOrganization;

        return [
            'user' => $user,
            'organization' => $organization,
            'token' => $token,
        ];
    }

    /**
     * Create Owner role for an organization with all permissions
     */
    protected function createOwnerRole(Organization $organization): Role
    {
        $ownerRole = Role::create([
            'name' => 'Owner',
            'slug' => 'owner',
            'description' => 'Owner of the organization',
            'is_system' => true,
            'organization_id' => $organization->id,
        ]);

        // Assign all permissions to Owner role
        $allPermissionIds = Permission::pluck('id')->toArray();
        $ownerRole->permissions()->sync($allPermissionIds);

        return $ownerRole;
    }

    /**
     * Logout user by revoking current access token
     */
    public function logout(User $user): void
    {
        $token = $user->currentAccessToken();
        if ($token) {
            $token->delete();
        }
    }

    /**
     * Get authenticated user with current organization
     */
    public function getAuthenticatedUser(User $user): array
    {
        return [
            'user' => $user,
            'organization' => $user->currentOrganization,
        ];
    }
}
