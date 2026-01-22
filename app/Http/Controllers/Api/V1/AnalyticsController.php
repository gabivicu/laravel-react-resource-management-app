<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Analytics\Services\AnalyticsService;
use Illuminate\Http\Request;

class AnalyticsController extends BaseController
{
    public function __construct(
        protected AnalyticsService $analyticsService
    ) {}

    /**
     * Get dashboard statistics
     */
    public function dashboard(Request $request)
    {
        $organizationId = $request->user()->current_organization_id;

        if (! $organizationId) {
            return $this->error('No organization selected', 400);
        }

        $stats = $this->analyticsService->getDashboardStats($organizationId);

        return $this->success($stats, 'Dashboard statistics retrieved successfully');
    }

    /**
     * Get project statistics
     */
    public function projects(Request $request)
    {
        $organizationId = $request->user()->current_organization_id;

        if (! $organizationId) {
            return $this->error('No organization selected', 400);
        }

        $stats = $this->analyticsService->getProjectStats($organizationId);

        return $this->success($stats, 'Project statistics retrieved successfully');
    }

    /**
     * Get task statistics
     */
    public function tasks(Request $request)
    {
        $organizationId = $request->user()->current_organization_id;

        if (! $organizationId) {
            return $this->error('No organization selected', 400);
        }

        $stats = $this->analyticsService->getTaskStats($organizationId);

        return $this->success($stats, 'Task statistics retrieved successfully');
    }

    /**
     * Get resource statistics
     */
    public function resources(Request $request)
    {
        $organizationId = $request->user()->current_organization_id;

        if (! $organizationId) {
            return $this->error('No organization selected', 400);
        }

        $stats = $this->analyticsService->getResourceStats($organizationId);

        return $this->success($stats, 'Resource statistics retrieved successfully');
    }

    /**
     * Get task completion trend
     */
    public function taskCompletionTrend(Request $request)
    {
        $organizationId = $request->user()->current_organization_id;

        if (! $organizationId) {
            return $this->error('No organization selected', 400);
        }

        $days = $request->get('days', 30);
        $trend = $this->analyticsService->getTaskCompletionTrend($organizationId, $days);

        return $this->success($trend, 'Task completion trend retrieved successfully');
    }
}
