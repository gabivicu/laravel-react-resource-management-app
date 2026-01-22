<?php

namespace App\Core\Contracts\Repositories;

use Illuminate\Database\Eloquent\Collection;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Pagination\LengthAwarePaginator;

/**
 * Base interface for all repositories
 *
 * Defines the standard contract for CRUD operations
 */
interface RepositoryInterface
{
    /**
     * Get all records
     */
    public function all(array $columns = ['*']): Collection;

    /**
     * Get a record by ID
     */
    public function find(int $id, array $columns = ['*']): ?Model;

    /**
     * Get a record or throw exception
     */
    public function findOrFail(int $id, array $columns = ['*']): Model;

    /**
     * Create a new record
     */
    public function create(array $data): Model;

    /**
     * Update an existing record
     */
    public function update(int $id, array $data): bool;

    /**
     * Delete a record
     */
    public function delete(int $id): bool;

    /**
     * Pagination
     */
    public function paginate(int $perPage = 15, array $columns = ['*']): LengthAwarePaginator;

    /**
     * Search by criteria
     */
    public function findBy(array $criteria, array $columns = ['*']): Collection;

    /**
     * Find the first record that meets the criteria
     */
    public function findOneBy(array $criteria, array $columns = ['*']): ?Model;
}
