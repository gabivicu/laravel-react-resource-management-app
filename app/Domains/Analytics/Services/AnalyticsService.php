<?php

namespace App\Domains\Analytics\Services;

use App\Domains\Project\Models\Project;
use App\Domains\Resource\Models\ResourceAllocation;
use App\Domains\Task\Models\Task;
use App\Domains\User\Models\User;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class AnalyticsService
{
    /**
     * Cache TTL in seconds (10 minutes)
     */
    protected const CACHE_TTL = 600;

    /**
     * Get dashboard statistics
     */
    public function getDashboardStats(int $organizationId): array
    {
        return Cache::remember("org_{$organizationId}_dashboard_stats", self::CACHE_TTL, function () use ($organizationId) {
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
        });
    }

    /**
     * Get project statistics
     */
    public function getProjectStats(int $organizationId): array
    {
        return Cache::remember("org_{$organizationId}_project_stats", self::CACHE_TTL, function () use ($organizationId) {
            $totalProjects = Project::where('organization_id', $organizationId)->count();

            $statusBreakdown = Project::where('organization_id', $organizationId)
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            // Calculate average tasks directly without loading all projects
            $totalTasks = Task::where('organization_id', $organizationId)->count();
            $avgTasks = $totalProjects > 0 ? $totalTasks / $totalProjects : 0;

            return [
                'total' => $totalProjects,
                'by_status' => $statusBreakdown,
                'average_tasks_per_project' => round($avgTasks, 2),
            ];
        });
    }

    /**
     * Get task statistics
     */
    public function getTaskStats(int $organizationId): array
    {
        return Cache::remember("org_{$organizationId}_task_stats", self::CACHE_TTL, function () use ($organizationId) {
            $totalTasks = Task::where('organization_id', $organizationId)->count();

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

            // Optimize sums by calculating in DB
            $sums = Task::where('organization_id', $organizationId)
                ->selectRaw('COALESCE(SUM(estimated_hours), 0) as estimated, COALESCE(SUM(actual_hours), 0) as actual')
                ->first();

            $totalEstimatedHours = $sums->estimated ?? 0;
            $totalActualHours = $sums->actual ?? 0;

            return [
                'total' => $totalTasks,
                'by_status' => $statusBreakdown,
                'by_priority' => $priorityBreakdown,
                'total_estimated_hours' => (float) $totalEstimatedHours,
                'total_actual_hours' => (float) $totalActualHours,
                'completion_rate' => $totalEstimatedHours > 0
                    ? round(($totalActualHours / $totalEstimatedHours) * 100, 2)
                    : 0,
            ];
        });
    }

    /**
     * Get resource allocation statistics
     */
    public function getResourceStats(int $organizationId): array
    {
        return Cache::remember("org_{$organizationId}_resource_stats", self::CACHE_TTL, function () use ($organizationId) {
            $allocations = ResourceAllocation::where('organization_id', $organizationId)
                ->active()
                ->with(['user', 'project'])
                ->get();

            $totalAllocation = $allocations->sum('allocation_percentage');
            $usersWithAllocations = $allocations->pluck('user_id')->unique()->count();

            $byProject = $allocations->groupBy('project_id')->map(function ($group) {
                return [
                    'project_name' => $group->first()->project->title ?? 'N/A', // Changed from name to title as per Project model
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
        });
    }

    /**
     * Get time series data for tasks completion
     */
    public function getTaskCompletionTrend(int $organizationId, int $days = 30): array
    {
        return Cache::remember("org_{$organizationId}_task_trend_{$days}", self::CACHE_TTL, function () use ($organizationId, $days) {
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
        });
    }
}
