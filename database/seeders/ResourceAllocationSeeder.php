<?php

namespace Database\Seeders;

use App\Domains\Resource\Models\ResourceAllocation;
use App\Domains\Project\Models\Project;
use App\Domains\Organization\Models\Organization;
use App\Domains\User\Models\User;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class ResourceAllocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $organization = Organization::first();
        
        if (!$organization) {
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

        if ($users->isEmpty()) {
            $this->command->error('No users found. Please run UserSeeder first.');
            return;
        }

        $roles = ['Developer', 'Designer', 'Project Manager', 'QA Engineer', 'DevOps', 'Analyst'];

        // Create allocations for active projects
        $activeProjects = $projects->where('status', 'active');
        
        foreach ($activeProjects as $project) {
            $projectMembers = $project->members;
            
            if ($projectMembers->isEmpty()) {
                continue;
            }

            // Allocate resources to project members
            foreach ($projectMembers as $member) {
                $allocationPercentage = rand(25, 100);
                $startDate = $project->start_date ?? Carbon::now()->subMonths(1);
                $endDate = $project->end_date;

                // Some allocations might be ongoing (no end date)
                if (rand(0, 1)) {
                    $endDate = null;
                }

                ResourceAllocation::create([
                    'organization_id' => $organization->id,
                    'project_id' => $project->id,
                    'user_id' => $member->id,
                    'role' => $roles[array_rand($roles)],
                    'allocation_percentage' => $allocationPercentage,
                    'start_date' => $startDate,
                    'end_date' => $endDate,
                    'notes' => 'Allocated to ' . $project->name,
                ]);
            }
        }

        // Create some additional allocations for planning projects
        $planningProjects = $projects->where('status', 'planning');
        
        foreach ($planningProjects->take(2) as $project) {
            $selectedUsers = $users->random(rand(1, 3));
            
            foreach ($selectedUsers as $user) {
                ResourceAllocation::create([
                    'organization_id' => $organization->id,
                    'project_id' => $project->id,
                    'user_id' => $user->id,
                    'role' => $roles[array_rand($roles)],
                    'allocation_percentage' => rand(10, 50),
                    'start_date' => $project->start_date ?? Carbon::now()->addWeek(),
                    'end_date' => $project->end_date,
                    'notes' => 'Planned allocation for ' . $project->name,
                ]);
            }
        }

        $this->command->info('Resource allocations seeded successfully!');
    }
}
