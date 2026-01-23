<?php

namespace App\Traits;

use Illuminate\Support\Facades\Cache;

trait ClearsOrganizationCache
{
    /**
     * Clear all analytics cache for the given organization.
     */
    protected function clearOrganizationCache(int $organizationId): void
    {
        // These keys match the ones used in AnalyticsService
        Cache::forget("org_{$organizationId}_dashboard_stats");
        Cache::forget("org_{$organizationId}_project_stats");
        Cache::forget("org_{$organizationId}_task_stats");
        Cache::forget("org_{$organizationId}_resource_stats");

        // Also clear trend cache (wildcard delete is tricky without tags, so we might leave trend cached or use specific known keys)
        // Trend cache key includes days: "org_{$organizationId}_task_trend_{$days}"
        // Without cache tags, we can't easily clear all trend variations.
        // For now, let's accept trend might be slightly delayed (30 day trend doesn't change drastically in seconds).
        // Alternatively, we clear for common day ranges if critical.
        Cache::forget("org_{$organizationId}_task_trend_30");
        Cache::forget("org_{$organizationId}_task_trend_7");
    }
}
