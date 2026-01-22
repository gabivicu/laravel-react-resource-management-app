<?php

namespace App\Domains\Resource\Repositories;

use App\Core\Contracts\Repositories\RepositoryInterface;
use App\Core\Support\BaseRepository;
use App\Domains\Resource\Models\ResourceAllocation;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Pagination\LengthAwarePaginator;

class ResourceAllocationRepository extends BaseRepository implements RepositoryInterface
{
    public function model(): string
    {
        return ResourceAllocation::class;
    }

    /**
     * Get allocations with relationships
     */
    public function getWithRelations(array $relations = ['project', 'user']): Collection
    {
        return $this->query()->with($relations)->get();
    }

    /**
     * Get allocations by project ID
     */
    public function getByProject(int $projectId, array $relations = ['project', 'user']): Collection
    {
        return $this->query()
            ->where('project_id', $projectId)
            ->with($relations)
            ->orderBy('start_date', 'desc')
            ->get();
    }

    /**
     * Get allocations by user ID
     */
    public function getByUser(int $userId, array $relations = ['project', 'user']): Collection
    {
        return $this->query()
            ->where('user_id', $userId)
            ->with($relations)
            ->orderBy('start_date', 'desc')
            ->get();
    }

    /**
     * Get active allocations
     */
    public function getActive(array $relations = ['project', 'user']): Collection
    {
        return $this->query()
            ->active()
            ->with($relations)
            ->get();
    }

    /**
     * Get paginated allocations
     */
    public function paginate(int $perPage = 15, array $filters = []): LengthAwarePaginator
    {
        $query = $this->query();

        if (isset($filters['project_id'])) {
            $query->where('project_id', $filters['project_id']);
        }

        if (isset($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (isset($filters['active'])) {
            if ($filters['active']) {
                $query->active();
            }
        }

        if (isset($filters['date_from'])) {
            $query->where('start_date', '>=', $filters['date_from']);
        }

        if (isset($filters['date_to'])) {
            $query->where(function ($q) use ($filters) {
                $q->whereNull('end_date')
                    ->orWhere('end_date', '<=', $filters['date_to']);
            });
        }

        return $query->with(['project', 'user'])->orderBy('start_date', 'desc')->paginate($perPage);
    }

    /**
     * Get allocation with all relationships
     */
    public function findWithRelations(int $id, array $relations = ['project', 'user']): ?ResourceAllocation
    {
        return $this->query()->with($relations)->find($id);
    }
}
