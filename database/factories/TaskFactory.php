<?php

namespace Database\Factories;

use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\Task\Models\Task;
use Illuminate\Database\Eloquent\Factories\Factory;

class TaskFactory extends Factory
{
    protected $model = Task::class;

    public function definition(): array
    {
        return [
            'organization_id' => Organization::factory(),
            'project_id' => Project::factory(),
            'title' => $this->faker->sentence(4),
            'description' => $this->faker->paragraph(),
            'status' => $this->faker->randomElement(['todo', 'in_progress', 'review', 'done']),
            'priority' => $this->faker->randomElement(['low', 'medium', 'high', 'urgent']),
            'due_date' => $this->faker->optional()->dateTimeBetween('now', '+1 month'),
            'estimated_hours' => $this->faker->numberBetween(1, 40),
            'actual_hours' => $this->faker->optional()->numberBetween(1, 40),
            'order' => $this->faker->numberBetween(1, 100),
        ];
    }
}
