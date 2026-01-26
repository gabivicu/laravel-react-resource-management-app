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
     * Get dashboard statistics
     */
    public function getDashboardStats(?int $organizationId): array
    {
        $cacheKey = $organizationId ? "org_{$organizationId}_dashboard_stats" : 'global_dashboard_stats';

        return Cache::remember($cacheKey, config('analytics.cache.ttl', 600), function () use ($organizationId) {
            $queryProject = Project::query();
            $queryTask = Task::query();
            $queryUser = User::query();
            $queryAlloc = ResourceAllocation::query()->active();

            if ($organizationId) {
                $queryProject->where('organization_id', $organizationId);
                $queryTask->where('organization_id', $organizationId);
                $queryUser->whereHas('organizations', function ($q) use ($organizationId) {
                    $q->where('organizations.id', $organizationId);
                });
                $queryAlloc->where('organization_id', $organizationId);
            }

            return [
                'projects' => $queryProject->count(),
                'tasks' => $queryTask->count(),
                'users' => $queryUser->count(),
                'active_allocations' => $queryAlloc->count(),
            ];
        });
    }

    /**
     * Get project statistics
     */
    public function getProjectStats(?int $organizationId): array
    {
        $cacheKey = $organizationId ? "org_{$organizationId}_project_stats" : 'global_project_stats';

        return Cache::remember($cacheKey, config('analytics.cache.ttl', 600), function () use ($organizationId) {
            $queryProject = Project::query();
            $queryTask = Task::query();

            if ($organizationId) {
                $queryProject->where('organization_id', $organizationId);
                $queryTask->where('organization_id', $organizationId);
            }

            $totalProjects = $queryProject->count();

            // Clone queryProject for status breakdown to avoid modifying the original count query instance if re-used
            // But here we created new query instances.
            // For status breakdown:
            $breakdownQuery = Project::query();
            if ($organizationId) {
                $breakdownQuery->where('organization_id', $organizationId);
            }

            $statusBreakdown = $breakdownQuery
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            // Calculate average tasks directly without loading all projects
            $totalTasks = $queryTask->count();
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
    public function getTaskStats(?int $organizationId): array
    {
        $cacheKey = $organizationId ? "org_{$organizationId}_task_stats" : 'global_task_stats';

        return Cache::remember($cacheKey, config('analytics.cache.ttl', 600), function () use ($organizationId) {
            $queryTask = Task::query();
            if ($organizationId) {
                $queryTask->where('organization_id', $organizationId);
            }

            $totalTasks = $queryTask->count();

            $breakdownQuery = Task::query();
            if ($organizationId) {
                $breakdownQuery->where('organization_id', $organizationId);
            }
            $statusBreakdown = $breakdownQuery
                ->select('status', DB::raw('count(*) as count'))
                ->groupBy('status')
                ->pluck('count', 'status')
                ->toArray();

            $priorityQuery = Task::query();
            if ($organizationId) {
                $priorityQuery->where('organization_id', $organizationId);
            }
            $priorityBreakdown = $priorityQuery
                ->select('priority', DB::raw('count(*) as count'))
                ->groupBy('priority')
                ->pluck('count', 'priority')
                ->toArray();

            // Optimize sums by calculating in DB
            $sumsQuery = Task::query();
            if ($organizationId) {
                $sumsQuery->where('organization_id', $organizationId);
            }
            $sums = $sumsQuery
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
    public function getResourceStats(?int $organizationId): array
    {
        $cacheKey = $organizationId ? "org_{$organizationId}_resource_stats" : 'global_resource_stats';

        return Cache::remember($cacheKey, config('analytics.cache.ttl', 600), function () use ($organizationId) {
            $queryAlloc = ResourceAllocation::query()->active()->with(['user', 'project']);
            if ($organizationId) {
                $queryAlloc->where('organization_id', $organizationId);
            }

            $allocations = $queryAlloc->get();

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
        });
    }

    /**
     * Get time series data for tasks completion
     */
    public function getTaskCompletionTrend(?int $organizationId, int $days = 30): array
    {
        $cacheKey = $organizationId ? "org_{$organizationId}_task_trend_{$days}" : "global_task_trend_{$days}";

        return Cache::remember($cacheKey, config('analytics.cache.ttl', 600), function () use ($organizationId, $days) {
            $startDate = now()->subDays($days);

            $queryTask = Task::query()
                ->where('status', 'done')
                ->where('updated_at', '>=', $startDate);

            if ($organizationId) {
                $queryTask->where('organization_id', $organizationId);
            }

            $completedTasks = $queryTask
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
