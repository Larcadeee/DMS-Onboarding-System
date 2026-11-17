<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use Illuminate\Database\Seeder;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Define permissions grouped by domain
        $permissions = [
            // User Management
            ['name' => 'users.view', 'group' => 'users', 'description' => 'View user accounts'],
            ['name' => 'users.create', 'group' => 'users', 'description' => 'Create user accounts'],
            ['name' => 'users.update', 'group' => 'users', 'description' => 'Update user accounts'],
            ['name' => 'users.delete', 'group' => 'users', 'description' => 'Delete user accounts'],
            ['name' => 'users.manage_roles', 'group' => 'users', 'description' => 'Assign/change user roles'],

            // Trainee Management
            ['name' => 'trainees.view', 'group' => 'trainees', 'description' => 'View trainee profiles'],
            ['name' => 'trainees.create', 'group' => 'trainees', 'description' => 'Create trainee profiles'],
            ['name' => 'trainees.update', 'group' => 'trainees', 'description' => 'Update trainee profiles'],
            ['name' => 'trainees.delete', 'group' => 'trainees', 'description' => 'Delete trainee profiles'],
            ['name' => 'trainees.enroll', 'group' => 'trainees', 'description' => 'Enroll trainees in programs'],
            ['name' => 'trainees.export', 'group' => 'trainees', 'description' => 'Export trainee data'],

            // Program Management
            ['name' => 'programs.view', 'group' => 'programs', 'description' => 'View onboarding programs'],
            ['name' => 'programs.create', 'group' => 'programs', 'description' => 'Create onboarding programs'],
            ['name' => 'programs.update', 'group' => 'programs', 'description' => 'Update onboarding programs'],
            ['name' => 'programs.delete', 'group' => 'programs', 'description' => 'Delete onboarding programs'],
            ['name' => 'programs.publish', 'group' => 'programs', 'description' => 'Publish/unpublish programs'],

            // Module Management
            ['name' => 'modules.view', 'group' => 'modules', 'description' => 'View training modules'],
            ['name' => 'modules.create', 'group' => 'modules', 'description' => 'Create training modules'],
            ['name' => 'modules.update', 'group' => 'modules', 'description' => 'Update training modules'],
            ['name' => 'modules.delete', 'group' => 'modules', 'description' => 'Delete training modules'],
            ['name' => 'modules.manage_content', 'group' => 'modules', 'description' => 'Manage module learning materials'],

            // Schedule Management
            ['name' => 'schedules.view', 'group' => 'schedules', 'description' => 'View training schedules'],
            ['name' => 'schedules.create', 'group' => 'schedules', 'description' => 'Create training schedules'],
            ['name' => 'schedules.update', 'group' => 'schedules', 'description' => 'Update training schedules'],
            ['name' => 'schedules.delete', 'group' => 'schedules', 'description' => 'Delete training schedules'],
            ['name' => 'schedules.assign_trainer', 'group' => 'schedules', 'description' => 'Assign trainers to schedules'],

            // Attendance Management
            ['name' => 'attendance.view', 'group' => 'attendance', 'description' => 'View attendance records'],
            ['name' => 'attendance.record', 'group' => 'attendance', 'description' => 'Record attendance'],
            ['name' => 'attendance.update', 'group' => 'attendance', 'description' => 'Update attendance records'],
            ['name' => 'attendance.export', 'group' => 'attendance', 'description' => 'Export attendance reports'],

            // Assessment Management
            ['name' => 'assessments.view', 'group' => 'assessments', 'description' => 'View assessments'],
            ['name' => 'assessments.create', 'group' => 'assessments', 'description' => 'Create assessments'],
            ['name' => 'assessments.update', 'group' => 'assessments', 'description' => 'Update assessments'],
            ['name' => 'assessments.delete', 'group' => 'assessments', 'description' => 'Delete assessments'],
            ['name' => 'assessments.grade', 'group' => 'assessments', 'description' => 'Grade assessments'],
            ['name' => 'assessments.export', 'group' => 'assessments', 'description' => 'Export assessment results'],

            // Competency Management
            ['name' => 'competencies.view', 'group' => 'competencies', 'description' => 'View competencies'],
            ['name' => 'competencies.create', 'group' => 'competencies', 'description' => 'Create competencies'],
            ['name' => 'competencies.update', 'group' => 'competencies', 'description' => 'Update competencies'],
            ['name' => 'competencies.delete', 'group' => 'competencies', 'description' => 'Delete competencies'],
            ['name' => 'competencies.evaluate', 'group' => 'competencies', 'description' => 'Evaluate trainee competencies'],
            ['name' => 'competencies.verify', 'group' => 'competencies', 'description' => 'Verify competency achievements'],

            // Reports
            ['name' => 'reports.view', 'group' => 'reports', 'description' => 'View reports and analytics'],
            ['name' => 'reports.export', 'group' => 'reports', 'description' => 'Export reports (PDF/Excel)'],

            // Audit Logs
            ['name' => 'audit_logs.view', 'group' => 'audit_logs', 'description' => 'View audit logs'],

            // Department Management
            ['name' => 'departments.view', 'group' => 'departments', 'description' => 'View departments'],
            ['name' => 'departments.create', 'group' => 'departments', 'description' => 'Create departments'],
            ['name' => 'departments.update', 'group' => 'departments', 'description' => 'Update departments'],
            ['name' => 'departments.delete', 'group' => 'departments', 'description' => 'Delete departments'],

            // Role & Permission Management
            ['name' => 'roles.view', 'group' => 'roles', 'description' => 'View roles'],
            ['name' => 'roles.create', 'group' => 'roles', 'description' => 'Create roles'],
            ['name' => 'roles.update', 'group' => 'roles', 'description' => 'Update roles'],
            ['name' => 'roles.delete', 'group' => 'roles', 'description' => 'Delete roles'],
            ['name' => 'permissions.view', 'group' => 'permissions', 'description' => 'View permissions'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(
                ['name' => $permission['name']],
                $permission
            );
        }

        // Define roles with their permissions
        $roles = [
            'super_admin' => [
                'label' => 'System Administrator',
                'description' => 'Full access to system configuration, user management, training management, and system records.',
                'permissions' => Permission::all()->pluck('name')->toArray(),
            ],
            'training_supervisor' => [
                'label' => 'Training Supervisor',
                'description' => 'Oversees onboarding programs, monitors trainee progress, reviews assessments, and approves training completion.',
                'permissions' => [
                    // Users: view only
                    'users.view',
                    // Trainees: full access
                    'trainees.view', 'trainees.create', 'trainees.update', 'trainees.enroll', 'trainees.export',
                    // Programs: full access
                    'programs.view', 'programs.create', 'programs.update', 'programs.delete', 'programs.publish',
                    // Modules: full access
                    'modules.view', 'modules.create', 'modules.update', 'modules.delete', 'modules.manage_content',
                    // Schedules: full access
                    'schedules.view', 'schedules.create', 'schedules.update', 'schedules.delete', 'schedules.assign_trainer',
                    // Attendance: full access
                    'attendance.view', 'attendance.record', 'attendance.update', 'attendance.export',
                    // Assessments: full access
                    'assessments.view', 'assessments.create', 'assessments.update', 'assessments.delete', 'assessments.grade', 'assessments.export',
                    // Competencies: full access
                    'competencies.view', 'competencies.create', 'competencies.update', 'competencies.delete', 'competencies.evaluate', 'competencies.verify',
                    // Reports: full access
                    'reports.view', 'reports.export',
                    // Audit logs: view
                    'audit_logs.view',
                    // Departments: view
                    'departments.view',
                    // Roles/Permissions: view
                    'roles.view', 'permissions.view',
                ],
            ],
            'trainer' => [
                'label' => 'Trainer / Evaluator',
                'description' => 'Manages assigned training sessions, records attendance, conducts assessments, and submits trainee evaluations.',
                'permissions' => [
                    // Trainees: view enrolled trainees
                    'trainees.view',
                    // Programs: view
                    'programs.view',
                    // Modules: view
                    'modules.view',
                    // Schedules: view and update assigned
                    'schedules.view', 'schedules.update',
                    // Attendance: record for assigned sessions
                    'attendance.view', 'attendance.record', 'attendance.update',
                    // Assessments: view, create, grade for assigned modules
                    'assessments.view', 'assessments.create', 'assessments.update', 'assessments.grade',
                    // Competencies: evaluate
                    'competencies.view', 'competencies.evaluate',
                    // Reports: view own sessions
                    'reports.view',
                ],
            ],
            'trainee' => [
                'label' => 'Emergency Telecommunicator (Trainee)',
                'description' => 'Views assigned onboarding modules, training schedules, learning materials, assessment results, and personal progress.',
                'permissions' => [
                    // Programs: view enrolled
                    'programs.view',
                    // Modules: view assigned
                    'modules.view',
                    // Schedules: view own
                    'schedules.view',
                    // Attendance: view own
                    'attendance.view',
                    // Assessments: view own, take assessments
                    'assessments.view',
                    // Competencies: view own progress
                    'competencies.view',
                    // Reports: view own progress
                    'reports.view',
                ],
            ],
        ];

        foreach ($roles as $roleName => $roleData) {
            $role = Role::firstOrCreate(
                ['name' => $roleName],
                [
                    'label' => $roleData['label'],
                    'description' => $roleData['description'],
                ]
            );

            $permissionIds = Permission::whereIn('name', $roleData['permissions'])->pluck('id')->toArray();
            $role->permissions()->sync($permissionIds);
        }

        $this->command->info('Roles and permissions seeded successfully.');
    }
}