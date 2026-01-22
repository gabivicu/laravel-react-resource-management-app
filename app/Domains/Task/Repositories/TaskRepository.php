<?php

namespace App\Domains\Task\Repositories;

use App\Core\Contracts\Repositories\RepositoryInterface;
use App\Core\Support\BaseRepository;
use App\Domains\Task\Models\Task;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class TaskRepository extends BaseRepository implements RepositoryInterface
{
    public function model(): string
    {
        return Task::class;
    }

    /**
     * Get tasks with relationships
     */
    public function getWithRelations(array $relations = ['project', 'assignees']): Collection
    {
        return $this->query()->with($relations)->get();
    }

    /**
     * Get tasks by project ID
     */
    public function getByProject(int $projectId, array $relations = ['project', 'assignees']): Collection
    {
        return $this->query()
            ->where('project_id', $projectId)
            ->with($relations)
            ->orderBy('order')
            ->orderBy('created_at')
            ->get();
    }

    /**
     * Get tasks grouped by status (for Kanban)
     */
    public function getGroupedByStatus(?int $projectId = null, array $relations = ['project', 'assignees']): array
    {
        $query = $this->query()->with($relations);

        if ($projectId) {
            $query->where('project_id', $projectId);
        }

        $tasks = $query->orderBy('order')->orderBy('created_at')->get();

        return [
            'todo' => $tasks->where('status', 'todo')->values(),
            'in_progress' => $tasks->where('status', 'in_progress')->values(),
            'review' => $tasks->where('status', 'review')->values(),
            'done' => $tasks->where('status', 'done')->values(),
        ];
    }

    /**
     * Get paginated tasks
     */
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = $this->query();

        if (isset($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['priority'])) {
            $query->where('priority', $filters['priority']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('title', 'like', '%'.$filters['search'].'%')
                    ->orWhere('description', 'like', '%'.$filters['search'].'%');
            });
        }

        return $query->with(['project', 'assignees'])->orderBy('order')->paginate($perPage);
    }

    /**
     * Get task with all relationships
     */
    public function findWithRelations(int $id, array $relations = ['project', 'assignees']): ?Task
    {
        return $this->query()->with($relations)->find($id);
    }

    /**
     * Update task order (for Kanban drag & drop)
     */
    public function updateOrder(int $id, int $order, ?string $status = null): bool
    {
        $task = $this->findOrFail($id);

        $data = ['order' => $order];
        if ($status !== null) {
            $data['status'] = $status;
        }

        return $task->update($data);
    }

    /**
     * Get next order number for a status
     */
    public function getNextOrder(int $projectId, string $status): int
    {
        $maxOrder = $this->query()
            ->where('project_id', $projectId)
            ->where('status', $status)
            ->max('order');

        return ($maxOrder ?? 0) + 1;
    }
}
