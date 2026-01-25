<?php

namespace App\Providers;

use App\Domains\Project\Models\Project;
use App\Domains\Resource\Models\ResourceAllocation;
use App\Domains\Task\Models\Task;
use App\Observers\ProjectObserver;
use App\Observers\ResourceAllocationObserver;
use App\Observers\TaskObserver;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

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

        // Configure rate limiters for API security
        $this->configureRateLimiting();
    }

    /**
     * Configure rate limiting for API endpoints.
     */
    protected function configureRateLimiting(): void
    {
        // Disable rate limiting in local environment
        if (app()->environment('local')) {
            // Return unlimited rate limits for local development
            RateLimiter::for('auth', function (Request $request) {
                return Limit::none();
            });

            RateLimiter::for('api-write', function (Request $request) {
                return Limit::none();
            });

            RateLimiter::for('api-read', function (Request $request) {
                return Limit::none();
            });

            RateLimiter::for('api', function (Request $request) {
                return Limit::none();
            });

            return;
        }

        // Rate limiter for authentication endpoints (strict)
        RateLimiter::for('auth', function (Request $request) {
            return Limit::perMinute(5)->by($request->ip());
        });

        // Rate limiter for write operations (POST, PUT, DELETE)
        RateLimiter::for('api-write', function (Request $request) {
            $key = $request->user()
                ? 'user:'.$request->user()->id
                : 'ip:'.$request->ip();

            return Limit::perMinute(60)->by($key);
        });

        // Rate limiter for read operations (GET)
        RateLimiter::for('api-read', function (Request $request) {
            $key = $request->user()
                ? 'user:'.$request->user()->id
                : 'ip:'.$request->ip();

            return Limit::perMinute(300)->by($key);
        });

        // General API rate limiter
        RateLimiter::for('api', function (Request $request) {
            $key = $request->user()
                ? 'user:'.$request->user()->id
                : 'ip:'.$request->ip();

            return Limit::perMinute(120)->by($key);
        });
    }
}
