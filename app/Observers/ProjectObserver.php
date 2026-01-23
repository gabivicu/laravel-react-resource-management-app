<?php

namespace App\Observers;

use App\Domains\Project\Models\Project;
use App\Traits\ClearsOrganizationCache;

class ProjectObserver
{
    use ClearsOrganizationCache;

    /**
     * Handle the Project "created" event.
     */
    public function created(Project $project): void
    {
        $this->clearOrganizationCache($project->organization_id);
    }

    /**
     * Handle the Project "updated" event.
     */
    public function updated(Project $project): void
    {
        $this->clearOrganizationCache($project->organization_id);
    }

    /**
     * Handle the Project "deleted" event.
     */
    public function deleted(Project $project): void
    {
        $this->clearOrganizationCache($project->organization_id);
    }
}
