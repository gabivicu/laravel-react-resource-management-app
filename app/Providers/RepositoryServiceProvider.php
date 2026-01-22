<?php

namespace App\Providers;

use Illuminate\Support\ServiceProvider;

/**
 * Service Provider pentru binding-uri Repository
 *
 * Aici se înregistrează toate repository-urile și interfețele lor
 */
class RepositoryServiceProvider extends ServiceProvider
{
    /**
     * Register services.
     */
    public function register(): void
    {
        // Binding-uri pentru repositories vor fi adăugate aici
        // Exemplu:
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
