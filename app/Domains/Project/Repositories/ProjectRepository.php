<?php

namespace App\Domains\Project\Repositories;

use App\Core\Contracts\Repositories\RepositoryInterface;
use App\Core\Support\BaseRepository;
use App\Domains\Project\Models\Project;
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
            $searchTerm = strtolower($filters['search']);
            $query->where(function ($q) use ($searchTerm) {
                $q->whereRaw('LOWER(name) LIKE ?', ['%'.$searchTerm.'%'])
                    ->orWhereRaw('LOWER(description) LIKE ?', ['%'.$searchTerm.'%']);
            });
        }

        return $query->with(['members', 'tasks'])->paginate($perPage);
    }

    /**
     * Get project with all relationships
     */
    public function findWithRelations(int $id, array $relations = ['members', 'tasks.assignees']): ?Project
    {
        return $this->query()->with($relations)->find($id);
    }
}
