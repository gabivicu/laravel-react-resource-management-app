<?php

namespace Database\Seeders;

use App\Domains\User\Models\User;
use App\Domains\Organization\Models\Organization;
use App\Domains\Permission\Models\Role;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get or create a default organization
        $organization = Organization::first();
        
        if (!$organization) {
            $organization = Organization::create([
                'name' => 'Demo Organization',
                'slug' => 'demo-organization',
                'is_active' => true,
            ]);
        }

        // Get Owner role (created by PermissionSeeder)
        $ownerRole = Role::where('slug', 'owner')
            ->where('organization_id', $organization->id)
            ->first();

        // Create admin user
        $admin = User::create([
            'name' => 'Admin User',
            'email' => 'admin@demo.com',
            'password' => Hash::make('password'),
            'current_organization_id' => $organization->id,
        ]);

        // Attach admin to organization with Owner role if it exists
        if ($ownerRole) {
            $organization->users()->attach($admin->id, ['role_id' => $ownerRole->id]);
        } else {
            // If Owner role doesn't exist, create it
            $ownerRole = Role::create([
                'name' => 'Owner',
                'slug' => 'owner',
                'description' => 'Owner of the organization',
                'is_system' => true,
                'organization_id' => $organization->id,
            ]);
            
            // Assign all permissions to Owner role
            $allPermissions = \App\Domains\Permission\Models\Permission::pluck('id')->toArray();
            $ownerRole->permissions()->sync($allPermissions);
            
            $organization->users()->attach($admin->id, ['role_id' => $ownerRole->id]);
        }

        // Create team members
        $teamMembers = [
            ['name' => 'John Developer', 'email' => 'john@demo.com'],
            ['name' => 'Jane Designer', 'email' => 'jane@demo.com'],
            ['name' => 'Bob Manager', 'email' => 'bob@demo.com'],
            ['name' => 'Alice Tester', 'email' => 'alice@demo.com'],
            ['name' => 'Charlie Analyst', 'email' => 'charlie@demo.com'],
        ];

        foreach ($teamMembers as $member) {
            $user = User::create([
                'name' => $member['name'],
                'email' => $member['email'],
                'password' => Hash::make('password'),
                'current_organization_id' => $organization->id,
            ]);

            $organization->users()->attach($user->id);
        }

        $this->command->info('Users seeded successfully!');
    }
}
