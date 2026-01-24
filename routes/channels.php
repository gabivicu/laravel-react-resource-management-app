<?php

use App\Domains\Project\Models\Project;
use Illuminate\Support\Facades\Broadcast;

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});

Broadcast::channel('projects.{projectId}', function ($user, $projectId) {
    if ($user->isSuperAdmin()) {
        return true;
    }

    $project = Project::find($projectId);

    return $project && $project->organization_id === $user->current_organization_id;
});
