<?php

namespace Database\Seeders;

use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\Task\Models\Task;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class LargeScaleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Disable query log to save memory
        DB::disableQueryLog();

        $this->command->info('Starting large scale seeding...');

        // Get or create an organization
        $organization = Organization::first() ?? Organization::factory()->create([
            'name' => 'Large Scale Tech',
            'slug' => 'large-scale-tech',
        ]);

        $this->command->info("Using Organization: {$organization->name}");

        // Create 500 Projects
        $projectCount = 500;
        $tasksPerProject = 100; // 500 * 100 = 50,000 tasks

        $this->command->getOutput()->progressStart($projectCount);

        // Chunking the creation to manage memory better
        for ($i = 0; $i < $projectCount; $i++) {
            Project::factory()
                ->has(
                    Task::factory()
                        ->count($tasksPerProject)
                        ->state(function (array $attributes, Project $project) use ($organization) {
                            return ['organization_id' => $organization->id];
                        })
                )
                ->create([
                    'organization_id' => $organization->id,
                ]);

            $this->command->getOutput()->progressAdvance();
        }

        $this->command->getOutput()->progressFinish();
        $this->command->info('Seeding completed: 500 Projects and 50,000 Tasks created.');
    }
}
