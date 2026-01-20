<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Project\Services\ProjectService;
use App\Http\Requests\Project\StoreProjectRequest;
use App\Http\Requests\Project\UpdateProjectRequest;
use Illuminate\Http\Request;

class ProjectController extends BaseController
{
    public function __construct(
        protected ProjectService $projectService
    ) {}

    /**
     * Display a listing of projects
     */
    public function index(Request $request)
    {
        $filters = $request->only(['status', 'search']);
        $perPage = $request->get('per_page', 15);
        
        $projects = $this->projectService->getPaginated($filters, $perPage);

        return $this->success($projects->items(), 'Projects retrieved successfully', 200, [
            'pagination' => [
                'current_page' => $projects->currentPage(),
                'last_page' => $projects->lastPage(),
                'per_page' => $projects->perPage(),
                'total' => $projects->total(),
            ],
        ]);
    }

    /**
     * Store a newly created project
     */
    public function store(StoreProjectRequest $request)
    {
        $organizationId = $request->user()->current_organization_id;
        
        if (!$organizationId) {
            return $this->error('No organization selected', 400);
        }

        $data = $request->validated();
        $data['user_id'] = $request->user()->id; // Add creator as member

        $project = $this->projectService->create($data, $organizationId);

        return $this->success($project, 'Project created successfully', 201);
    }

    /**
     * Display the specified project
     */
    public function show(int $id)
    {
        $project = $this->projectService->find($id);

        if (!$project) {
            return $this->error('Project not found', 404);
        }

        return $this->success($project, 'Project retrieved successfully');
    }

    /**
     * Update the specified project
     */
    public function update(UpdateProjectRequest $request, int $id)
    {
        $project = $this->projectService->update($id, $request->validated());

        return $this->success($project, 'Project updated successfully');
    }

    /**
     * Remove the specified project
     */
    public function destroy(int $id)
    {
        $deleted = $this->projectService->delete($id);

        if (!$deleted) {
            return $this->error('Failed to delete project', 500);
        }

        return $this->success(null, 'Project deleted successfully');
    }
}
