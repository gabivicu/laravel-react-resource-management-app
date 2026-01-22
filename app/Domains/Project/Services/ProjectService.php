<?php

namespace App\Domains\Project\Services;

use App\Domains\Project\Models\Project;
use App\Domains\Project\Repositories\ProjectRepository;
use Illuminate\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\DB;

class ProjectService
{
    public function __construct(
        protected ProjectRepository $projectRepository
    ) {}

    /**
     * Get paginated projects
     */
    public function getPaginated(array $filters = [], int $perPage = 15): LengthAwarePaginator
    {
        return $this->projectRepository->paginate($perPage, $filters);
    }

    /**
     * Get all projects
     */
    public function getAll(array $relations = []): \Illuminate\Database\Eloquent\Collection
    {
        return $this->projectRepository->getWithRelations($relations);
    }

    /**
     * Get project by ID with relations
     */
    public function find(int $id, array $relations = ['members.user', 'tasks.assignees']): ?Project
    {
        return $this->projectRepository->findWithRelations($id, $relations);
    }

    /**
     * Create a new project
     */
    public function create(array $data, int $organizationId): Project
    {
        return DB::transaction(function () use ($data, $organizationId) {
            $project = Project::create([
                'organization_id' => $organizationId,
                'name' => $data['name'],
                'description' => $data['description'] ?? null,
                'status' => $data['status'] ?? 'planning',
                'start_date' => $data['start_date'] ?? null,
                'end_date' => $data['end_date'] ?? null,
                'budget' => $data['budget'] ?? null,
                'settings' => $data['settings'] ?? null,
            ]);

            // Add creator as project member if provided
            if (isset($data['user_id'])) {
                $project->members()->attach($data['user_id'], [
                    'role' => 'owner',
                    'joined_at' => now(),
                ]);
            }

            return $project->load(['members', 'tasks']);
        });
    }

    /**
     * Update project
     */
    public function update(int $id, array $data): Project
    {
        $project = $this->projectRepository->findOrFail($id);

        $project->update([
            'name' => $data['name'] ?? $project->name,
            'description' => $data['description'] ?? $project->description,
            'status' => $data['status'] ?? $project->status,
            'start_date' => $data['start_date'] ?? $project->start_date,
            'end_date' => $data['end_date'] ?? $project->end_date,
            'budget' => $data['budget'] ?? $project->budget,
            'settings' => $data['settings'] ?? $project->settings,
        ]);

        return $project->load(['members', 'tasks']);
    }

    /**
     * Delete project
     */
    public function delete(int $id): bool
    {
        $project = $this->projectRepository->findOrFail($id);

        return $project->delete();
    }

    /**
     * Add member to project
     */
    public function addMember(int $projectId, int $userId, string $role = 'member'): void
    {
        $project = $this->projectRepository->findOrFail($projectId);

        if (! $project->members()->where('user_id', $userId)->exists()) {
            $project->members()->attach($userId, [
                'role' => $role,
                'joined_at' => now(),
            ]);
        }
    }

    /**
     * Remove member from project
     */
    public function removeMember(int $projectId, int $userId): void
    {
        $project = $this->projectRepository->findOrFail($projectId);
        $project->members()->detach($userId);
    }
}
