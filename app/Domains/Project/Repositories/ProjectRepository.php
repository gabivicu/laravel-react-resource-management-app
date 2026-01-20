<?php

namespace App\Domains\Project\Repositories;

use App\Core\Support\BaseRepository;
use App\Domains\Project\Models\Project;
use App\Core\Contracts\Repositories\RepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ProjectRepository extends BaseRepository implements RepositoryInterface
{
    public function model(): string
    {
        return Project::class;
    }

    /**
     * Get projects with relationships
     */
    public function getWithRelations(array $relations = ['members', 'tasks']): Collection
    {
        return $this->query()->with($relations)->get();
    }

    /**
     * Get paginated projects
     */
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = $this->query();

        if (isset($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (isset($filters['search'])) {
            $query->where(function ($q) use ($filters) {
                $q->where('name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
            });
        }

        return $query->with(['members', 'tasks'])->paginate($perPage);
    }

    /**
     * Get project with all relationships
     */
    public function findWithRelations(int $id, array $relations = ['members.user', 'tasks.assignees']): ?Project
    {
        return $this->query()->with($relations)->find($id);
    }
}
