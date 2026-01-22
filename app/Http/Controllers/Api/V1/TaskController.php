<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Task\Services\TaskService;
use App\Http\Requests\Task\StoreTaskRequest;
use App\Http\Requests\Task\UpdateTaskRequest;
use Illuminate\Http\Request;

class TaskController extends BaseController
{
    public function __construct(
        protected TaskService $taskService
    ) {}

    /**
     * Display a listing of tasks
     */
    public function index(Request $request)
    {
        $filters = $request->only(['project_id', 'status', 'priority', 'search']);
        $perPage = $request->get('per_page', 15);

        $tasks = $this->taskService->getPaginated($filters, $perPage);

        return $this->success($tasks->items(), 'Tasks retrieved successfully', 200, [
            'pagination' => [
                'current_page' => $tasks->currentPage(),
                'last_page' => $tasks->lastPage(),
                'per_page' => $tasks->perPage(),
                'total' => $tasks->total(),
            ],
        ]);
    }

    /**
     * Get tasks grouped by status (for Kanban)
     */
    public function kanban(Request $request)
    {
        $projectId = $request->get('project_id');

        $tasks = $this->taskService->getGroupedByStatus($projectId);

        return $this->success($tasks, 'Tasks retrieved successfully');
    }

    /**
     * Store a newly created task
     */
    public function store(StoreTaskRequest $request)
    {
        $organizationId = $request->user()->current_organization_id;

        if (! $organizationId) {
            return $this->error('No organization selected', 400);
        }

        $data = $request->validated();
        $task = $this->taskService->create($data, $organizationId);

        return $this->success($task, 'Task created successfully', 201);
    }

    /**
     * Display the specified task
     */
    public function show(int $id)
    {
        $task = $this->taskService->find($id);

        if (! $task) {
            return $this->error('Task not found', 404);
        }

        return $this->success($task, 'Task retrieved successfully');
    }

    /**
     * Update the specified task
     */
    public function update(UpdateTaskRequest $request, int $id)
    {
        $task = $this->taskService->update($id, $request->validated());

        return $this->success($task, 'Task updated successfully');
    }

    /**
     * Update task order (for Kanban drag & drop)
     */
    public function updateOrder(Request $request, int $id)
    {
        $request->validate([
            'order' => ['required', 'integer', 'min:0'],
            'status' => ['nullable', 'in:todo,in_progress,review,done'],
        ]);

        $task = $this->taskService->updateOrder(
            $id,
            $request->input('order'),
            $request->input('status')
        );

        return $this->success($task, 'Task order updated successfully');
    }

    /**
     * Remove the specified task
     */
    public function destroy(int $id)
    {
        $deleted = $this->taskService->delete($id);

        if (! $deleted) {
            return $this->error('Failed to delete task', 500);
        }

        return $this->success(null, 'Task deleted successfully');
    }
}
