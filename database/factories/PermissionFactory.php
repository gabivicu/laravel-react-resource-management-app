<?php

namespace Database\Factories;

use App\Domains\Permission\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

class PermissionFactory extends Factory
{
    protected $model = Permission::class;

    public function definition(): array
    {
        $groups = ['projects', 'tasks', 'users', 'resources', 'organizations'];
        $group = $this->faker->randomElement($groups);
        $action = $this->faker->randomElement(['create', 'read', 'update', 'delete', 'manage']);
        // Generate unique slug using UUID to avoid conflicts with seeder permissions
        $uniqueId = Str::uuid()->toString();
        $slug = "{$group}.{$action}.{$uniqueId}";

        return [
            'name' => ucfirst($action).' '.ucfirst($group),
            'slug' => $slug,
            'description' => "Permission to {$action} {$group}",
            'group' => $group,
        ];
    }
}
// test
