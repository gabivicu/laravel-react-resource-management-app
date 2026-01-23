<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $this->avatar,
            'role' => $this->whenPivotLoaded('project_members', function () {
                return $this->pivot->role;
            }),
            'joined_at' => $this->whenPivotLoaded('project_members', function () {
                return $this->pivot->joined_at;
            }),
            'current_organization_id' => $this->current_organization_id,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
