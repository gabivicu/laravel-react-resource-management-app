<?php

namespace Database\Seeders;

use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\Task\Models\Task;
use App\Domains\User\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class TaskSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $organization = Organization::first();

        if (! $organization) {
            $this->command->error('No organization found. Please run UserSeeder first.');

            return;
        }

        $projects = Project::where('organization_id', $organization->id)->get();

        if ($projects->isEmpty()) {
            $this->command->error('No projects found. Please run ProjectSeeder first.');

            return;
        }

        $users = User::whereHas('organizations', function ($q) use ($organization) {
            $q->where('organizations.id', $organization->id);
        })->get();

        $statuses = ['todo', 'in_progress', 'review', 'done'];
        $priorities = ['low', 'medium', 'high', 'urgent'];

        foreach ($projects as $project) {
            // Create tasks for each project
            $taskTemplates = [
                [
                    'title' => 'Setup project repository',
                    'description' => 'Initialize Git repository and setup CI/CD pipeline',
                    'status' => 'done',
                    'priority' => 'high',
                    'estimated_hours' => 4,
                    'actual_hours' => 3.5,
                ],
                [
                    'title' => 'Design database schema',
                    'description' => 'Create ERD and database migration scripts',
                    'status' => 'done',
                    'priority' => 'high',
                    'estimated_hours' => 8,
                    'actual_hours' => 7,
                ],
                [
                    'title' => 'Implement authentication',
                    'description' => 'Setup user authentication and authorization',
                    'status' => 'in_progress',
                    'priority' => 'high',
                    'estimated_hours' => 12,
                    'actual_hours' => 8,
                ],
                [
                    'title' => 'Create API endpoints',
                    'description' => 'Develop RESTful API endpoints for core features',
                    'status' => 'in_progress',
                    'priority' => 'medium',
                    'estimated_hours' => 16,
                    'actual_hours' => 10,
                ],
                [
                    'title' => 'Write unit tests',
                    'description' => 'Create comprehensive unit tests for all modules',
                    'status' => 'todo',
                    'priority' => 'medium',
                    'estimated_hours' => 20,
                ],
                [
                    'title' => 'Code review',
                    'description' => 'Review code quality and best practices',
                    'status' => 'review',
                    'priority' => 'medium',
                    'estimated_hours' => 6,
                    'actual_hours' => 4,
                ],
                [
                    'title' => 'Performance optimization',
                    'description' => 'Optimize database queries and API response times',
                    'status' => 'todo',
                    'priority' => 'low',
                    'estimated_hours' => 10,
                ],
                [
                    'title' => 'Documentation',
                    'description' => 'Write API documentation and user guides',
                    'status' => 'todo',
                    'priority' => 'low',
                    'estimated_hours' => 8,
                ],
            ];

            $order = 1;
            foreach ($taskTemplates as $template) {
                $dueDate = null;
                if ($template['status'] === 'todo' || $template['status'] === 'in_progress') {
                    $dueDate = Carbon::now()->addDays(rand(1, 14));
                } elseif ($template['status'] === 'done') {
                    $dueDate = Carbon::now()->subDays(rand(1, 30));
                }

                $task = Task::create([
                    'organization_id' => $organization->id,
                    'project_id' => $project->id,
                    'title' => $template['title'],
                    'description' => $template['description'],
                    'status' => $template['status'],
                    'priority' => $template['priority'],
                    'due_date' => $dueDate,
                    'estimated_hours' => $template['estimated_hours'],
                    'actual_hours' => $template['actual_hours'] ?? null,
                    'order' => $order++,
                ]);

                // Assign random users to tasks
                if ($users->isNotEmpty()) {
                    $assignees = $users->random(rand(1, 2));
                    $task->assignees()->attach($assignees->pluck('id')->toArray());
                }
            }

            // Create some additional random tasks
            for ($i = 0; $i < rand(3, 5); $i++) {
                $status = $statuses[array_rand($statuses)];
                $priority = $priorities[array_rand($priorities)];

                $dueDate = null;
                if ($status === 'todo' || $status === 'in_progress') {
                    $dueDate = Carbon::now()->addDays(rand(1, 21));
                } elseif ($status === 'done') {
                    $dueDate = Carbon::now()->subDays(rand(1, 60));
                }

                $task = Task::create([
                    'organization_id' => $organization->id,
                    'project_id' => $project->id,
                    'title' => 'Task '.($order++).' - '.ucfirst($priority).' Priority',
                    'description' => 'Random task for testing purposes',
                    'status' => $status,
                    'priority' => $priority,
                    'due_date' => $dueDate,
                    'estimated_hours' => rand(2, 16),
                    'actual_hours' => $status === 'done' ? rand(1, 12) : null,
                    'order' => $order - 1,
                ]);

                if ($users->isNotEmpty()) {
                    $assignees = $users->random(rand(1, 2));
                    $task->assignees()->attach($assignees->pluck('id')->toArray());
                }
            }
        }

        $this->command->info('Tasks seeded successfully!');
    }
}
