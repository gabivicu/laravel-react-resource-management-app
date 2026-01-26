<?php

namespace Database\Factories;

use App\Domains\Permission\Models\Permission;
use Illuminate\Database\Eloquent\Factories\Factory;

class PermissionFactory extends Factory
{
    protected $model = Permission::class;

    public function definition(): array
    {
        $groups = ['projects', 'tasks', 'users', 'resources', 'organizations'];
        $group = $this->faker->randomElement($groups);
        $action = $this->faker->randomElement(['create', 'read', 'update', 'delete', 'manage']);
        $slug = "{$group}.{$action}";

        return [
            'name' => ucfirst($action).' '.ucfirst($group),
            'slug' => $slug,
            'description' => "Permission to {$action} {$group}",
            'group' => $group,
        ];
    }
}
