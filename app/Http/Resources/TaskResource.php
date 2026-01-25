<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TaskResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'status' => $this->status,
            'priority' => $this->priority,
            'order' => $this->order ?? 0,
            'due_date' => $this->due_date?->format('Y-m-d'),
            'estimated_hours' => $this->estimated_hours ? (float) $this->estimated_hours : null,
            'actual_hours' => $this->actual_hours ? (float) $this->actual_hours : null,
            'project_id' => $this->project_id,
            'project' => $this->when(
                $this->relationLoaded('project') && $this->project !== null,
                function () {
                    return $this->project ? new ProjectResource($this->project) : null;
                }
            ),
            'assignees' => $this->when(
                $this->relationLoaded('assignees'),
                function () {
                    return UserResource::collection($this->assignees ?? collect());
                }
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ];
    }
}
