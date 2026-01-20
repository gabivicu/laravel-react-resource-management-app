<?php

namespace Tests\Unit;

use App\Domains\Task\Services\TaskService;
use App\Domains\Task\Repositories\TaskRepository;
use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\Task\Models\Task;
use App\Domains\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TaskServiceTest extends TestCase
{
    use RefreshDatabase;

    protected TaskService $taskService;
    protected Organization $organization;
    protected Project $project;

    protected function setUp(): void
    {
        parent::setUp();
        $this->taskService = new TaskService(new TaskRepository());
        $this->organization = Organization::factory()->create();
        $this->project = Project::factory()->create([
            'organization_id' => $this->organization->id,
        ]);
    }

    #[Test]
    public function it_can_create_a_task()
    {
        $data = [
            'project_id' => $this->project->id,
            'title' => 'Test Task',
            'description' => 'Test Description',
            'status' => 'todo',
            'priority' => 'high',
        ];

        $task = $this->taskService->create($data, $this->organization->id);

        $this->assertInstanceOf(Task::class, $task);
        $this->assertEquals('Test Task', $task->title);
        $this->assertEquals('todo', $task->status);
        $this->assertEquals('high', $task->priority);
        $this->assertEquals($this->project->id, $task->project_id);
    }

    #[Test]
    public function it_sets_default_order_when_creating_task()
    {
        $data = [
            'project_id' => $this->project->id,
            'title' => 'Test Task',
            'status' => 'todo',
        ];

        $task = $this->taskService->create($data, $this->organization->id);

        $this->assertGreaterThan(0, $task->order);
    }

    #[Test]
    public function it_can_assign_users_to_task()
    {
        $user1 = User::factory()->create();
        $user2 = User::factory()->create();

        $data = [
            'project_id' => $this->project->id,
            'title' => 'Test Task',
            'assignee_ids' => [$user1->id, $user2->id],
        ];

        $task = $this->taskService->create($data, $this->organization->id);

        $this->assertTrue($task->assignees->contains($user1->id));
        $this->assertTrue($task->assignees->contains($user2->id));
    }

    #[Test]
    public function it_can_update_task_order()
    {
        $task = Task::factory()->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'order' => 1,
        ]);

        $updatedTask = $this->taskService->updateOrder($task->id, 5, 'in_progress');

        $this->assertEquals(5, $updatedTask->order);
        $this->assertEquals('in_progress', $updatedTask->status);
    }

    #[Test]
    public function it_can_get_tasks_grouped_by_status()
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

        $result = $this->taskService->getGroupedByStatus($this->project->id);

        $this->assertArrayHasKey('todo', $result);
        $this->assertArrayHasKey('done', $result);
        $this->assertCount(1, $result['todo']);
        $this->assertCount(1, $result['done']);
    }

    #[Test]
    public function it_can_delete_a_task()
    {
        $task = Task::factory()->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
        ]);

        $result = $this->taskService->delete($task->id);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('tasks', ['id' => $task->id]);
    }
}
