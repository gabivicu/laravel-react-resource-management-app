<?php

namespace App\Domains\Resource\Services;

use App\Domains\Resource\Models\ResourceAllocation;
use App\Domains\Resource\Repositories\ResourceAllocationRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ResourceAllocationService
{
    public function __construct(
        protected ResourceAllocationRepository $allocationRepository
    ) {}

    /**
     * Get paginated allocations
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->allocationRepository->paginate($perPage, $filters);
    }

    /**
     * Get allocations by project
     */
    public function getByProject(int $projectId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->allocationRepository->getByProject($projectId);
    }

    /**
     * Get allocations by user
     */
    public function getByUser(int $userId): \Illuminate\Database\Eloquent\Collection
    {
        return $this->allocationRepository->getByUser($userId);
    }

    /**
     * Get active allocations
     */
    public function getActive(): \Illuminate\Database\Eloquent\Collection
    {
        return $this->allocationRepository->getActive();
    }

    /**
     * Get allocation by ID
     */
    public function find(int $id): ?ResourceAllocation
    {
        return $this->allocationRepository->findWithRelations($id);
    }

    /**
     * Create a new allocation
     */
    public function create(array $data, int $organizationId): ResourceAllocation
    {
        return DB::transaction(function () use ($data, $organizationId) {
            // Validate allocation percentage doesn't exceed 100% for user in date range
            $this->validateAllocationPercentage($data);

            $allocation = ResourceAllocation::create([
                'organization_id' => $organizationId,
                'project_id' => $data['project_id'],
                'user_id' => $data['user_id'],
                'role' => $data['role'] ?? null,
                'allocation_percentage' => $data['allocation_percentage'],
                'start_date' => $data['start_date'],
                'end_date' => $data['end_date'] ?? null,
                'notes' => $data['notes'] ?? null,
            ]);

            return $allocation->load(['project', 'user']);
        });
    }

    /**
     * Update allocation
     */
    public function update(int $id, array $data): ResourceAllocation
    {
        $allocation = $this->allocationRepository->findOrFail($id);

        // Validate allocation percentage if changed
        if (isset($data['allocation_percentage']) || isset($data['start_date']) || isset($data['end_date'])) {
            $updateData = array_merge($allocation->toArray(), $data);
            $this->validateAllocationPercentage($updateData, $id);
        }

        $allocation->update([
            'project_id' => $data['project_id'] ?? $allocation->project_id,
            'user_id' => $data['user_id'] ?? $allocation->user_id,
            'role' => $data['role'] ?? $allocation->role,
            'allocation_percentage' => $data['allocation_percentage'] ?? $allocation->allocation_percentage,
            'start_date' => $data['start_date'] ?? $allocation->start_date,
            'end_date' => $data['end_date'] ?? $allocation->end_date,
            'notes' => $data['notes'] ?? $allocation->notes,
        ]);

        return $allocation->load(['project', 'user']);
    }

    /**
     * Delete allocation
     */
    public function delete(int $id): bool
    {
        $allocation = $this->allocationRepository->findOrFail($id);
        return $allocation->delete();
    }

    /**
     * Validate that user's total allocation doesn't exceed 100%
     */
    protected function validateAllocationPercentage(array $data, ?int $excludeId = null): void
    {
        $userId = $data['user_id'];
        $startDate = $data['start_date'];
        $endDate = $data['end_date'] ?? null;
        $allocationPercentage = $data['allocation_percentage'];

        $query = ResourceAllocation::where('user_id', $userId)
            ->where('id', '!=', $excludeId)
            ->where(function ($q) use ($startDate, $endDate) {
                $q->where(function ($q2) use ($startDate, $endDate) {
                    // Overlapping allocations
                    $q2->whereBetween('start_date', [$startDate, $endDate ?? '9999-12-31'])
                       ->orWhereBetween('end_date', [$startDate, $endDate ?? '9999-12-31'])
                       ->orWhere(function ($q3) use ($startDate, $endDate) {
                           $q3->where('start_date', '<=', $startDate)
                              ->where(function ($q4) use ($endDate) {
                                  $q4->whereNull('end_date')
                                     ->orWhere('end_date', '>=', $endDate ?? '9999-12-31');
                              });
                       });
                });
            });

        $totalAllocation = $query->sum('allocation_percentage');

        if (($totalAllocation + $allocationPercentage) > 100) {
            throw ValidationException::withMessages([
                'allocation_percentage' => [
                    'Total allocation exceeds 100%. Current allocation: ' . $totalAllocation . '%',
                ],
            ]);
        }
    }
}
