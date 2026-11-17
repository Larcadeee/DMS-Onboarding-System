<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    /**
     * Role → permission matrix.
     *
     * super_admin holds every permission (it is also granted
     * implicitly in code via User::hasPermission()).
     */
    public const MATRIX = [
        'training_supervisor' => [
            'trainees.view', 'trainees.create', 'trainees.update', 'trainees.archive',
            'programs.view', 'programs.create', 'programs.update', 'programs.manage-phases', 'programs.enroll-trainees',
            'modules.view', 'modules.manage',
            'schedules.view', 'schedules.manage',
            'attendance.view',
            'assessments.view', 'assessments.manage', 'assessments.grade',
            'competencies.view', 'competencies.manage', 'competencies.evaluate',
            'reports.view', 'reports.export',
        ],
        'trainer' => [
            'trainees.view',
            'modules.view',
            'schedules.view',
            'attendance.view', 'attendance.record',
            'assessments.view', 'assessments.grade',
            'competencies.view', 'competencies.evaluate',
        ],
        'trainee' => [
            'self.view',
        ],
    ];

    public function run(): void
    {
        $allPermissions = Permission::query()->pluck('id', 'name');

        foreach (Role::query()->get() as $role) {
            if ($role->name === 'super_admin') {
                $role->permissions()->sync($allPermissions->values());

                continue;
            }

            $permissionNames = self::MATRIX[$role->name] ?? [];

            $role->permissions()->sync(
                $allPermissions->only($permissionNames)->values()
            );
        }
    }
}
