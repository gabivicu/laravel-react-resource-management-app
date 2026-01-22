<?php

namespace Tests\Unit;

use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\Project\Repositories\ProjectRepository;
use App\Domains\Project\Services\ProjectService;
use App\Domains\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProjectServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ProjectService $projectService;

    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        $this->projectService = new ProjectService(new ProjectRepository);
        $this->organization = Organization::factory()->create();
    }

    #[Test]
    public function it_can_create_a_project()
    {
        $user = User::factory()->create();
        $this->organization->users()->attach($user->id);

        $data = [
            'name' => 'Test Project',
            'description' => 'Test Description',
            'status' => 'active',
            'user_id' => $user->id,
        ];

        $project = $this->projectService->create($data, $this->organization->id);

        $this->assertInstanceOf(Project::class, $project);
        $this->assertEquals('Test Project', $project->name);
        $this->assertEquals('active', $project->status);
        $this->assertEquals($this->organization->id, $project->organization_id);
    }

    #[Test]
    public function it_adds_creator_as_project_member()
    {
        $user = User::factory()->create();
        $this->organization->users()->attach($user->id);

        $data = [
            'name' => 'Test Project',
            'user_id' => $user->id,
        ];

        $project = $this->projectService->create($data, $this->organization->id);

        $this->assertTrue($project->members->contains($user->id));
    }

    #[Test]
    public function it_can_update_a_project()
    {
        $project = Project::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Original Name',
            'status' => 'planning',
        ]);

        $data = [
            'name' => 'Updated Name',
            'status' => 'active',
        ];

        $updatedProject = $this->projectService->update($project->id, $data);

        $this->assertEquals('Updated Name', $updatedProject->name);
        $this->assertEquals('active', $updatedProject->status);
    }

    #[Test]
    public function it_can_delete_a_project()
    {
        $project = Project::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $result = $this->projectService->delete($project->id);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    #[Test]
    public function it_can_get_paginated_projects()
    {
        Project::factory()->count(20)->create([
            'organization_id' => $this->organization->id,
        ]);

        $result = $this->projectService->getPaginated([], 10);

        $this->assertCount(10, $result->items());
        $this->assertEquals(20, $result->total());
    }

    #[Test]
    public function it_can_filter_projects_by_status()
    {
        Project::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'active',
        ]);

        Project::factory()->create([
            'organization_id' => $this->organization->id,
            'status' => 'completed',
        ]);

        $result = $this->projectService->getPaginated(['status' => 'active'], 15);

        $this->assertCount(1, $result->items());
        $this->assertEquals('active', $result->items()[0]->status);
    }
}
