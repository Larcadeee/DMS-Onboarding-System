<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Collection;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role_id',
        'department_id',
        'employee_number',
        'is_active',
        'last_login_at',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'is_active'         => 'boolean',
            'last_login_at'     => 'datetime',
        ];
    }

    public function role(): BelongsTo
    {
        return $this->belongsTo(Role::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function trainee(): HasOne
    {
        return $this->hasOne(Trainee::class);
    }

    /**
     * Determine whether the user has any of the given role names.
     */
    public function hasRole(string ...$roles): bool
    {
        return $this->role !== null && in_array($this->role->name, $roles, true);
    }

    /**
     * Determine whether the user's role grants ALL of the given permission names.
     * System administrators hold every permission implicitly.
     */
    public function hasPermission(string ...$permissions): bool
    {
        if ($permissions === []) {
            return true;
        }

        if ($this->hasRole('super_admin')) {
            return true;
        }

        $granted = $this->permissionNames();

        return collect($permissions)->every(
            fn (string $permission) => $granted->contains($permission)
        );
    }

    /**
     * Determine whether the user's role grants ANY of the given permission names.
     */
    public function hasAnyPermission(string ...$permissions): bool
    {
        if ($permissions === []) {
            return false;
        }

        if ($this->hasRole('super_admin')) {
            return true;
        }

        return $this->permissionNames()
            ->intersect($permissions)
            ->isNotEmpty();
    }

    /**
     * Names of every permission granted through the user's role.
     */
    public function permissionNames(): Collection
    {
        if ($this->role === null) {
            return collect();
        }

        return $this->role->permissions->pluck('name');
    }
}