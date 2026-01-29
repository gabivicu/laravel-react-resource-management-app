<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $avatar = $this->avatar;

        // Convert relative URL to absolute if needed
        if ($avatar && ! str_starts_with($avatar, 'http')) {
            $appUrl = rtrim(config('app.url'), '/');
            $avatar = $appUrl.$avatar;
        }

        // Get role_id from organization_user pivot for current organization
        $organizationId = $request->user()->current_organization_id ?? null;
        $roleId = null;

        if ($organizationId && $this->organizations) {
            $organization = $this->organizations->firstWhere('id', $organizationId);
            if ($organization && $organization->pivot) {
                $roleId = $organization->pivot->role_id;
            }
        }

        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'avatar' => $avatar,
            'role_id' => $roleId,
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
