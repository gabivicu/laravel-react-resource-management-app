<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Service Provider for Repository bindings
 *
 * All repositories and their interfaces are registered here
 */
class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Repository bindings will be added here
        // Example:
        // $this->app->bind(
        //     \App\Domains\Project\Repositories\Contracts\ProjectRepositoryInterface::class,
        //     \App\Domains\Project\Repositories\ProjectRepository::class
        // );
    }

    /**
     * Bootstrap services.
     */
    public function boot(): void
    {
        //
    }
}
