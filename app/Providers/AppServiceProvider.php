<?php

namespace App\Providers;

use App\Domains\Project\Models\Project;
use App\Domains\Resource\Models\ResourceAllocation;
use App\Domains\Task\Models\Task;
use App\Observers\ProjectObserver;
use App\Observers\ResourceAllocationObserver;
use App\Observers\TaskObserver;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\Log;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        // Register Sentry if DSN is configured and package is installed
        if (config('sentry.dsn') && class_exists(\Sentry\Laravel\ServiceProvider::class)) {
            $this->app->register(\Sentry\Laravel\ServiceProvider::class);
        }
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Project::observe(ProjectObserver::class);
        Task::observe(TaskObserver::class);
        ResourceAllocation::observe(ResourceAllocationObserver::class);
    }
}
