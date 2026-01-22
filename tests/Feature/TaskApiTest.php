<?php

namespace Tests\Feature;

use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\Task\Models\Task;
use App\Domains\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TaskApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Organization $organization;

    protected Project $project;

    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();
        $this->organization = Organization::factory()->create();
        $this->user = User::factory()->create([
            'current_organization_id' => $this->organization->id,
        ]);
        $this->organization->users()->attach($this->user->id);
        $this->project = Project::factory()->create([
            'organization_id' => $this->organization->id,
        ]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    #[Test]
    public function it_can_list_tasks()
    {
        Task::factory()->count(3)->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/tasks');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [],
            ]);
    }

    #[Test]
    public function it_can_get_kanban_tasks()
    {
        Task::factory()->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'status' => 'todo',
        ]);

        Task::factory()->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'status' => 'done',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson("/api/v1/tasks/kanban?project_id={$this->project->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['todo', 'in_progress', 'review', 'done'],
            ]);
    }

    #[Test]
    public function it_can_create_a_task()
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/tasks', [
                'project_id' => $this->project->id,
                'title' => 'New Task',
                'description' => 'Task Description',
                'status' => 'todo',
                'priority' => 'high',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => ['id', 'title', 'status'],
            ]);

        $this->assertDatabaseHas('tasks', [
            'title' => 'New Task',
            'project_id' => $this->project->id,
        ]);
    }

    #[Test]
    public function it_can_update_task_order()
    {
        $task = Task::factory()->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'order' => 1,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson("/api/v1/tasks/{$task->id}/order", [
                'order' => 5,
                'status' => 'in_progress',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('tasks', [
            'id' => $task->id,
            'order' => 5,
            'status' => 'in_progress',
        ]);
    }

    #[Test]
    public function it_validates_task_creation()
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/tasks', [
                'title' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['project_id', 'title']);
    }
}
