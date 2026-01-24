<?php

namespace App\Domains\Task\Services;

use App\Domains\Task\Models\Task;
use App\Domains\Task\Repositories\TaskRepository;
use App\Events\TaskMoved;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class TaskService
{
    public function __construct(
        protected TaskRepository $taskRepository
    ) {}

    /**
     * Get paginated tasks
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->taskRepository->paginate($perPage, $filters);
    }

    /**
     * Get tasks by project ID
     */
    public function getByProject(int $projectId, array $relations = []): \Illuminate\Database\Eloquent\Collection
    {
        return $this->taskRepository->getByProject($projectId, $relations);
    }

    /**
     * Get tasks grouped by status (for Kanban)
     */
    public function getGroupedByStatus(?int $projectId = null): array
    {
        return $this->taskRepository->getGroupedByStatus($projectId);
    }

    /**
     * Get task by ID with relations
     */
    public function find(int $id, array $relations = ['project', 'assignees']): ?Task
    {
        return $this->taskRepository->findWithRelations($id, $relations);
    }

    /**
     * Create a new task
     */
    public function create(array $data, int $organizationId): Task
    {
        return DB::transaction(function () use ($data, $organizationId) {
            // Get next order number for the status
            $order = $this->taskRepository->getNextOrder(
                $data['project_id'],
                $data['status'] ?? 'todo'
            );

            $task = Task::create([
                'organization_id' => $organizationId,
                'project_id' => $data['project_id'],
                'title' => $data['title'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'] ?? 'todo',
                'priority' => $data['priority'] ?? 'medium',
                'due_date' => $data['due_date'] ?? null,
                'estimated_hours' => $data['estimated_hours'] ?? null,
                'actual_hours' => $data['actual_hours'] ?? null,
                'order' => $order,
            ]);

            // Attach assignees if provided
            if (isset($data['assignee_ids']) && is_array($data['assignee_ids'])) {
                $task->assignees()->attach($data['assignee_ids']);
            }

            return $task->load(['project', 'assignees']);
        });
    }

    /**
     * Update task
     */
    public function update(int $id, array $data): Task
    {
        $task = $this->taskRepository->findOrFail($id);

        $updateData = [
            'title' => $data['title'] ?? $task->title,
            'description' => $data['description'] ?? $task->description,
            'status' => $data['status'] ?? $task->status,
            'priority' => $data['priority'] ?? $task->priority,
            'due_date' => $data['due_date'] ?? $task->due_date,
            'estimated_hours' => $data['estimated_hours'] ?? $task->estimated_hours,
            'actual_hours' => $data['actual_hours'] ?? $task->actual_hours,
        ];

        // Handle order update if status changed
        if (isset($data['status']) && $data['status'] !== $task->status) {
            $updateData['order'] = $this->taskRepository->getNextOrder(
                $task->project_id,
                $data['status']
            );
        }

        $task->update($updateData);

        // Update assignees if provided
        if (isset($data['assignee_ids']) && is_array($data['assignee_ids'])) {
            $task->assignees()->sync($data['assignee_ids']);
        }

        $task->load(['project', 'assignees']);

        TaskMoved::dispatch($task);

        return $task;
    }

    /**
     * Update task order and status (for Kanban drag & drop)
     */
    public function updateOrder(int $id, int $order, ?string $status = null): Task
    {
        $task = $this->taskRepository->findOrFail($id);

        $updateData = ['order' => $order];
        if ($status !== null && $status !== $task->status) {
            $updateData['status'] = $status;
        }

        $task->update($updateData);

        $task->load(['project', 'assignees']);

        TaskMoved::dispatch($task);

        return $task;
    }

    /**
     * Delete task
     */
    public function delete(int $id): bool
    {
        $task = $this->taskRepository->findOrFail($id);

        return $task->delete();
    }
}
