<?php

namespace Database\Factories;

use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\Resource\Models\ResourceAllocation;
use App\Domains\User\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Eloquent\Factories\Factory;

class ResourceAllocationFactory extends Factory
{
    protected $model = ResourceAllocation::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'project_id' => Project::factory(),
            'user_id' => User::factory(),
            'role' => $this->faker->randomElement(['Developer', 'Designer', 'Project Manager', 'QA Engineer']),
            'allocation_percentage' => $this->faker->numberBetween(10, 100),
            'start_date' => Carbon::now()->subDays(rand(1, 30)),
            'end_date' => $this->faker->optional()->dateTimeBetween('now', '+3 months'),
            'notes' => $this->faker->optional()->sentence(),
        ];
    }
}
