<?php

namespace Tests\Feature;

use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\Resource\Models\ResourceAllocation;
use App\Domains\Task\Models\Task;
use App\Domains\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AnalyticsApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Organization $organization;

    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->organization = Organization::factory()->create();
        $this->user = User::factory()->create([
            'current_organization_id' => $this->organization->id,
        ]);
        $this->organization->users()->attach($this->user->id);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    #[Test]
    public function it_can_get_dashboard_statistics()
    {
        Project::factory()->count(3)->create([
            'organization_id' => $this->organization->id,
        ]);

        Task::factory()->count(5)->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/analytics/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'projects',
                    'tasks',
                    'users',
                    'active_allocations',
                ],
            ]);

        $this->assertEquals(3, $response->json('data.projects'));
        $this->assertEquals(5, $response->json('data.tasks'));
    }

    #[Test]
    public function it_can_get_project_statistics()
    {
        Project::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'active',
        ]);

        Project::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'completed',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/analytics/projects');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total',
                    'by_status',
                    'average_tasks_per_project',
                ],
            ]);
    }

    #[Test]
    public function it_can_get_task_statistics()
    {
        Task::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'todo',
            'priority' => 'high',
        ]);

        Task::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'done',
            'priority' => 'medium',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/analytics/tasks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total',
                    'by_status',
                    'by_priority',
                    'total_estimated_hours',
                    'total_actual_hours',
                    'completion_rate',
                ],
            ]);
    }

    #[Test]
    public function it_can_get_resource_statistics()
    {
        $project = Project::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        ResourceAllocation::factory()->create([
            'organization_id' => $this->organization->id,
            'project_id' => $project->id,
            'user_id' => $this->user->id,
            'allocation_percentage' => 50,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/analytics/resources');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [
                    'total_active_allocations',
                    'users_with_allocations',
                    'total_allocation_percentage',
                    'by_project',
                ],
            ]);
    }
}
