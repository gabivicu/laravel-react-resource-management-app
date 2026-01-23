<?php

namespace Database\Seeders;

use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\Task\Models\Task;
use App\Domains\User\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;

class LoadTestSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('Starting Load Test Seeding...');

        $startTime = microtime(true);

        // 1. Create Organization
        $org = Organization::create([
            'name' => 'MegaCorp Load Test',
            'slug' => 'megacorp-load-test-'.uniqid(),
            'is_active' => true,
        ]);

        $this->command->info('Organization created.');

        // 2. Create 2000 Users
        $users = [];
        $password = Hash::make('password'); // Pre-hash for speed
        $now = now();

        $this->command->info('Generating 2000 Users...');

        // Chunk users creation to avoid memory issues
        for ($i = 0; $i < 2000; $i++) {
            $users[] = [
                'name' => "User Load {$i}",
                'email' => "user_load_{$i}_".uniqid().'@megacorp.test',
                'password' => $password,
                'email_verified_at' => $now,
                'created_at' => $now,
                'updated_at' => $now,
                'current_organization_id' => $org->id,
            ];

            if (count($users) >= 500) {
                User::insert($users);
                $users = [];
                $this->command->info('Inserted batch of users... Total so far: '.($i + 1));
            }
        }
        if (! empty($users)) {
            User::insert($users);
        }

        // 3. Create 500 Projects
        $this->command->info('Generating 500 Projects...');
        $projects = [];
        for ($i = 0; $i < 500; $i++) {
            $projects[] = [
                'organization_id' => $org->id,
                'name' => "Project Mega {$i}",
                'description' => "Load test project description {$i}",
                'status' => 'active',
                'start_date' => $now,
                'end_date' => $now->copy()->addMonths(6),
                'budget' => rand(10000, 1000000),
                'created_at' => $now,
                'updated_at' => $now,
            ];
        }

        foreach (array_chunk($projects, 100) as $chunk) {
            Project::insert($chunk);
        }

        $projectIds = Project::where('organization_id', $org->id)->pluck('id')->toArray();

        // 4. Create 50,000 Tasks
        $this->command->info('Generating 50,000 Tasks...');
        $tasks = [];
        $taskCount = 0;

        foreach ($projectIds as $projectId) {
            // Approx 100 tasks per project
            for ($j = 0; $j < 100; $j++) {
                $tasks[] = [
                    'organization_id' => $org->id,
                    'project_id' => $projectId,
                    'title' => "Task Load {$j} for Project {$projectId}",
                    'description' => "Description for task {$j}",
                    'status' => ['todo', 'in_progress', 'review', 'done'][rand(0, 3)],
                    'priority' => ['low', 'medium', 'high', 'urgent'][rand(0, 3)],
                    'order' => $j,
                    'estimated_hours' => rand(1, 40),
                    'actual_hours' => rand(0, 40),
                    'created_at' => $now,
                    'updated_at' => $now,
                ];

                $taskCount++;

                if (count($tasks) >= 1000) {
                    Task::insert($tasks);
                    $tasks = [];
                    $this->command->info("Inserted {$taskCount} tasks...");
                }
            }
        }
        if (! empty($tasks)) {
            Task::insert($tasks);
        }

        // Clear cache for this organization to reflect new data immediately
        Cache::forget("org_{$org->id}_dashboard_stats");
        Cache::forget("org_{$org->id}_project_stats");
        Cache::forget("org_{$org->id}_task_stats");
        Cache::forget("org_{$org->id}_resource_stats");

        $duration = round(microtime(true) - $startTime, 2);
        $this->command->info("Load Test Seeding Completed in {$duration} seconds!");
    }
}
