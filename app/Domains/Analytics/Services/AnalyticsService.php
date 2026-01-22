<?php

namespace App\Domains\Analytics\Services;

use App\Domains\Project\Models\Project;
use App\Domains\Resource\Models\ResourceAllocation;
use App\Domains\Task\Models\Task;
use App\Domains\User\Models\User;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Get dashboard statistics
     */
    public function getDashboardStats(int $organizationId): array
    {
        $projectsCount = Project::where('organization_id', $organizationId)->count();
        $tasksCount = Task::where('organization_id', $organizationId)->count();
        $usersCount = User::whereHas('organizations', function ($q) use ($organizationId) {
            $q->where('organizations.id', $organizationId);
        })->count();
        $activeAllocations = ResourceAllocation::where('organization_id', $organizationId)
            ->active()
            ->count();

        return [
            'projects' => $projectsCount,
            'tasks' => $tasksCount,
            'users' => $usersCount,
            'active_allocations' => $activeAllocations,
        ];
    }

    /**
     * Get project statistics
     */
    public function getProjectStats(int $organizationId): array
    {
        $projects = Project::where('organization_id', $organizationId)
            ->withCount('tasks')
            ->get();

        $statusBreakdown = Project::where('organization_id', $organizationId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        return [
            'total' => $projects->count(),
            'by_status' => $statusBreakdown,
            'average_tasks_per_project' => $projects->avg('tasks_count') ?? 0,
        ];
    }

    /**
     * Get task statistics
     */
    public function getTaskStats(int $organizationId): array
    {
        $tasks = Task::where('organization_id', $organizationId)->get();

        $statusBreakdown = Task::where('organization_id', $organizationId)
            ->select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $priorityBreakdown = Task::where('organization_id', $organizationId)
            ->select('priority', DB::raw('count(*) as count'))
            ->groupBy('priority')
            ->pluck('count', 'priority')
            ->toArray();

        $totalEstimatedHours = $tasks->sum('estimated_hours') ?? 0;
        $totalActualHours = $tasks->sum('actual_hours') ?? 0;

        return [
            'total' => $tasks->count(),
            'by_status' => $statusBreakdown,
            'by_priority' => $priorityBreakdown,
            'total_estimated_hours' => $totalEstimatedHours,
            'total_actual_hours' => $totalActualHours,
            'completion_rate' => $totalEstimatedHours > 0
                ? ($totalActualHours / $totalEstimatedHours) * 100
                : 0,
        ];
    }

    /**
     * Get resource allocation statistics
     */
    public function getResourceStats(int $organizationId): array
    {
        $allocations = ResourceAllocation::where('organization_id', $organizationId)
            ->active()
            ->with(['user', 'project'])
            ->get();

        $totalAllocation = $allocations->sum('allocation_percentage');
        $usersWithAllocations = $allocations->pluck('user_id')->unique()->count();

        $byProject = $allocations->groupBy('project_id')->map(function ($group) {
            return [
                'project_name' => $group->first()->project->name ?? 'N/A',
                'allocations_count' => $group->count(),
                'total_percentage' => $group->sum('allocation_percentage'),
            ];
        })->values();

        return [
            'total_active_allocations' => $allocations->count(),
            'users_with_allocations' => $usersWithAllocations,
            'total_allocation_percentage' => $totalAllocation,
            'by_project' => $byProject,
        ];
    }

    /**
     * Get time series data for tasks completion
     */
    public function getTaskCompletionTrend(int $organizationId, int $days = 30): array
    {
        $startDate = now()->subDays($days);

        $completedTasks = Task::where('organization_id', $organizationId)
            ->where('status', 'done')
            ->where('updated_at', '>=', $startDate)
            ->select(
                DB::raw('DATE(updated_at) as date'),
                DB::raw('count(*) as count')
            )
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        return $completedTasks->map(function ($item) {
            return [
                'date' => $item->date,
                'count' => $item->count,
            ];
        })->toArray();
    }
}
