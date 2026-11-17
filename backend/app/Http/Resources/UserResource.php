<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * Public representation of an authenticated user.
 *
 * Sensitive fields (password, remember_token, timestamps used only
 * internally) are never exposed; the role and its permission names
 * are included so the frontend can drive role-based UI.
 *
 * @mixin \App\Models\User
 */
class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'employee_number' => $this->employee_number,
            'is_active' => $this->is_active,
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            'role' => $this->whenLoaded('role', fn () => $this->role === null ? null : [
                'id' => $this->role->id,
                'name' => $this->role->name,
                'label' => $this->role->label,
                'permissions' => $this->role->relationLoaded('permissions')
                    ? $this->role->permissions->pluck('name')
                    : $this->role->permissions()->pluck('name'),
            ]),
            'department' => $this->whenLoaded('department', fn () => $this->department === null ? null : [
                'id' => $this->department->id,
                'name' => $this->department->name,
                'code' => $this->department->code,
            ]),
            'permissions' => $this->permissionNames(),
        ];
    }
}
