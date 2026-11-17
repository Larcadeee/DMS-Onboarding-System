<?php

namespace Database\Seeders;

use App\Models\Permission;
use Illuminate\Database\Seeder;

class PermissionSeeder extends Seeder
{
    /**
     * Permission catalogue, grouped by functional module.
     *
     * Naming convention: `{resource}.{action}`.
     * `self.*` permissions cover a trainee's access to their own
     * progress, materials, schedules, and results.
     */
    public const PERMISSIONS = [
        'users' => [
            'users.view' => 'View user accounts',
            'users.create' => 'Create user accounts',
            'users.update' => 'Update user accounts',
            'users.delete' => 'Deactivate or delete user accounts',
        ],
        'trainees' => [
            'trainees.view' => 'View trainee records',
            'trainees.create' => 'Register trainees',
            'trainees.update' => 'Update trainee profiles and status',
            'trainees.archive' => 'Archive trainee records',
        ],
        'programs' => [
            'programs.view' => 'View onboarding programs',
            'programs.create' => 'Create onboarding programs',
            'programs.update' => 'Update onboarding programs',
            'programs.manage-phases' => 'Manage program phases and modules',
            'programs.enroll-trainees' => 'Assign trainees to onboarding programs',
        ],
        'modules' => [
            'modules.view' => 'View training modules and materials',
            'modules.manage' => 'Create and manage training modules and materials',
        ],
        'schedules' => [
            'schedules.view' => 'View training schedules',
            'schedules.manage' => 'Create and manage training schedules',
        ],
        'attendance' => [
            'attendance.view' => 'View attendance records',
            'attendance.record' => 'Record attendance and participation',
        ],
        'assessments' => [
            'assessments.view' => 'View assessments and results',
            'assessments.manage' => 'Create and manage assessments',
            'assessments.grade' => 'Record scores, evaluations, and recommendations',
        ],
        'competencies' => [
            'competencies.view' => 'View the competency framework and progress',
            'competencies.manage' => 'Manage the competency framework',
            'competencies.evaluate' => 'Evaluate and validate trainee competencies',
        ],
        'reports' => [
            'reports.view' => 'View reports and analytics',
            'reports.export' => 'Export reports in PDF and Excel formats',
        ],
        'audit_logs' => [
            'audit_logs.view' => 'View system activity logs',
        ],
        'self' => [
            'self.view' => 'View own onboarding progress, materials, schedules, and results',
        ],
    ];

    public function run(): void
    {
        foreach (self::PERMISSIONS as $group => $permissions) {
            foreach ($permissions as $name => $description) {
                Permission::updateOrCreate(
                    ['name' => $name],
                    ['group' => $group, 'description' => $description]
                );
            }
        }
    }
}
