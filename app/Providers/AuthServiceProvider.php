<?php

namespace App\Providers;

use App\Domains\Permission\Models\Role;
use App\Domains\Permission\Policies\RolePolicy;
use App\Domains\Project\Models\Project;
use App\Domains\Project\Policies\ProjectPolicy;
use App\Domains\Resource\Models\ResourceAllocation;
use App\Domains\Resource\Policies\ResourceAllocationPolicy;
use App\Domains\Task\Models\Task;
use App\Domains\Task\Policies\TaskPolicy;
use App\Domains\User\Models\User;
use App\Domains\User\Policies\UserPolicy;
use Illuminate\Foundation\Support\Providers\AuthServiceProvider as ServiceProvider;

class AuthServiceProvider extends ServiceProvider
{
    /**
     * The policy mappings for the application.
     *
     * @var array<class-string, class-string>
     */
    protected $policies = [
        Project::class => ProjectPolicy::class,
        Task::class => TaskPolicy::class,
        ResourceAllocation::class => ResourceAllocationPolicy::class,
        User::class => UserPolicy::class,
        Role::class => RolePolicy::class,
    ];

    /**
     * Register any authentication / authorization services.
     */
    public function boot(): void
    {
        //
    }
}
