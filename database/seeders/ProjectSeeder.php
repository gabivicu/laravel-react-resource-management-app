<?php

namespace Database\Seeders;

use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\User\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class ProjectSeeder extends Seeder
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

        $users = User::whereHas('organizations', function ($q) use ($organization) {
            $q->where('organizations.id', $organization->id);
        })->get();

        if ($users->isEmpty()) {
            $this->command->error('No users found. Please run UserSeeder first.');

            return;
        }

        $projects = [
            [
                'name' => 'E-Commerce Platform',
                'description' => 'Development of a modern e-commerce platform with payment integration',
                'status' => 'active',
                'start_date' => Carbon::now()->subMonths(2),
                'end_date' => Carbon::now()->addMonths(4),
                'budget' => 50000.00,
            ],
            [
                'name' => 'Mobile App Redesign',
                'description' => 'Complete redesign of the mobile application with new UI/UX',
                'status' => 'active',
                'start_date' => Carbon::now()->subMonth(),
                'end_date' => Carbon::now()->addMonths(3),
                'budget' => 35000.00,
            ],
            [
                'name' => 'API Integration Project',
                'description' => 'Integration with third-party APIs for data synchronization',
                'status' => 'planning',
                'start_date' => Carbon::now()->addWeek(),
                'end_date' => Carbon::now()->addMonths(2),
                'budget' => 20000.00,
            ],
            [
                'name' => 'Security Audit',
                'description' => 'Comprehensive security audit and vulnerability assessment',
                'status' => 'on_hold',
                'start_date' => Carbon::now()->subWeeks(2),
                'end_date' => Carbon::now()->addMonth(),
                'budget' => 15000.00,
            ],
            [
                'name' => 'Legacy System Migration',
                'description' => 'Migration from legacy system to modern architecture',
                'status' => 'completed',
                'start_date' => Carbon::now()->subMonths(6),
                'end_date' => Carbon::now()->subMonth(),
                'budget' => 75000.00,
            ],
            [
                'name' => 'Marketing Website',
                'description' => 'New marketing website with CMS integration',
                'status' => 'active',
                'start_date' => Carbon::now()->subWeeks(3),
                'end_date' => Carbon::now()->addMonths(2),
                'budget' => 25000.00,
            ],
        ];

        foreach ($projects as $projectData) {
            $project = Project::create([
                'organization_id' => $organization->id,
                'name' => $projectData['name'],
                'description' => $projectData['description'],
                'status' => $projectData['status'],
                'start_date' => $projectData['start_date'],
                'end_date' => $projectData['end_date'],
                'budget' => $projectData['budget'],
            ]);

            // Add random members to each project
            $randomMembers = $users->random(rand(2, 4));
            foreach ($randomMembers as $member) {
                $project->members()->attach($member->id, [
                    'role' => ['owner', 'member', 'viewer'][rand(0, 2)],
                    'joined_at' => Carbon::now()->subDays(rand(1, 30)),
                ]);
            }
        }

        $this->command->info('Projects seeded successfully!');
    }
}
