<?php

namespace App\Core\Support;

use App\Core\Contracts\Repositories\RepositoryInterface;
use App\Core\Exceptions\RepositoryException;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Abstract base repository that implements standard CRUD operations
 */
abstract class BaseRepository implements RepositoryInterface
{
    protected Model $model;

    public function __construct()
    {
        $this->model = $this->makeModel();
    }

    /**
     * Specify the model for this repository
     */
    abstract protected function model(): string;

    /**
     * Create an instance of the model
     */
    protected function makeModel(): Model
    {
        $model = app($this->model());

        if (! $model instanceof Model) {
            throw new \Exception("Class {$this->model()} must be an instance of Illuminate\\Database\\Eloquent\\Model");
        }

        return $model;
    }

    /**
     * Get all records
     */
    public function all(array $columns = ['*']): Collection
    {
        return $this->model->select($columns)->get();
    }

    /**
     * Get a record by ID
     */
    public function find(int $id, array $columns = ['*']): ?Model
    {
        return $this->model->select($columns)->find($id);
    }

    /**
     * Get a record or throw exception
     */
    public function findOrFail(int $id, array $columns = ['*']): Model
    {
        return $this->model->select($columns)->findOrFail($id);
    }

    /**
     * Create a new record
     */
    public function create(array $data): Model
    {
        try {
            return $this->model->create($data);
        } catch (\Exception $e) {
            throw RepositoryException::createFailed($this->model()->getShortName(), $e->getMessage());
        }
    }

    /**
     * Update an existing record
     */
    public function update(int $id, array $data): bool
    {
        try {
            $model = $this->findOrFail($id);

            return $model->update($data);
        } catch (\Exception $e) {
            throw RepositoryException::updateFailed($this->model()->getShortName(), $id, $e->getMessage());
        }
    }

    /**
     * Delete a record
     */
    public function delete(int $id): bool
    {
        $model = $this->findOrFail($id);

        return $model->delete();
    }

    /**
     * Pagination
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator
    {
        return $this->model->select($columns)->paginate($perPage);
    }

    /**
     * Search by criteria
     */
    public function findBy(array $criteria, array $columns = ['*']): Collection
    {
        $query = $this->model->select($columns);

        foreach ($criteria as $key => $value) {
            if (is_array($value)) {
                $query->whereIn($key, $value);
            } else {
                $query->where($key, $value);
            }
        }

        return $query->get();
    }

    /**
     * Find the first record that meets the criteria
     */
    public function findOneBy(array $criteria, array $columns = ['*']): ?Model
    {
        return $this->findBy($criteria, $columns)->first();
    }

    /**
     * Get the query builder for custom queries
     */
    public function query()
    {
        return $this->model->newQuery();
    }
}
