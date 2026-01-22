<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Resource\Services\ResourceAllocationService;
use App\Http\Requests\ResourceAllocation\StoreResourceAllocationRequest;
use App\Http\Requests\ResourceAllocation\UpdateResourceAllocationRequest;
use Illuminate\Http\Request;

class ResourceAllocationController extends BaseController
{
    public function __construct(
        protected ResourceAllocationService $allocationService
    ) {}

    /**
     * Display a listing of resource allocations
     */
    public function index(Request $request)
    {
        $filters = $request->only(['project_id', 'user_id', 'active', 'date_from', 'date_to']);
        $perPage = $request->get('per_page', 15);

        $allocations = $this->allocationService->getPaginated($filters, $perPage);

        return $this->success($allocations->items(), 'Resource allocations retrieved successfully', 200, [
            'pagination' => [
                'current_page' => $allocations->currentPage(),
                'last_page' => $allocations->lastPage(),
                'per_page' => $allocations->perPage(),
                'total' => $allocations->total(),
            ],
        ]);
    }

    /**
     * Store a newly created resource allocation
     */
    public function store(StoreResourceAllocationRequest $request)
    {
        $organizationId = $request->user()->current_organization_id;

        if (! $organizationId) {
            return $this->error('No organization selected', 400);
        }

        $data = $request->validated();
        $allocation = $this->allocationService->create($data, $organizationId);

        return $this->success($allocation, 'Resource allocation created successfully', 201);
    }

    /**
     * Display the specified resource allocation
     */
    public function show(int $id)
    {
        $allocation = $this->allocationService->find($id);

        if (! $allocation) {
            return $this->error('Resource allocation not found', 404);
        }

        return $this->success($allocation, 'Resource allocation retrieved successfully');
    }

    /**
     * Update the specified resource allocation
     */
    public function update(UpdateResourceAllocationRequest $request, int $id)
    {
        try {
            $allocation = $this->allocationService->update($id, $request->validated());

            return $this->success($allocation, 'Resource allocation updated successfully');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->error('Validation failed', 422, $e->errors());
        }
    }

    /**
     * Remove the specified resource allocation
     */
    public function destroy(int $id)
    {
        $deleted = $this->allocationService->delete($id);

        if (! $deleted) {
            return $this->error('Failed to delete resource allocation', 500);
        }

        return $this->success(null, 'Resource allocation deleted successfully');
    }
}
