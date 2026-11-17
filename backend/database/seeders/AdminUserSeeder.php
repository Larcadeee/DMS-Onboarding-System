<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Initial accounts for local development and first deployment.
     *
     * Passwords are required to be changed on first production use.
     * RoleSeeder must run first so roles exist.
     */
    public const ACCOUNTS = [
        [
            'name' => 'CDRRMD Administrator',
            'email' => 'admin@cdrrmd.gov.ph',
            'password' => 'Admin@2024',
            'role' => 'super_admin',
            'employee_number' => 'CDRRMD-001',
        ],
        [
            'name' => 'Training Supervisor',
            'email' => 'supervisor@cdrrmd.gov.ph',
            'password' => 'Supervisor@2024',
            'role' => 'training_supervisor',
            'employee_number' => 'CDRRMD-002',
        ],
        [
            'name' => 'Trainer / Evaluator',
            'email' => 'trainer@cdrrmd.gov.ph',
            'password' => 'Trainer@2024',
            'role' => 'trainer',
            'employee_number' => 'CDRRMD-003',
        ],
        [
            'name' => 'ETC Trainee',
            'email' => 'trainee@cdrrmd.gov.ph',
            'password' => 'Trainee@2024',
            'role' => 'trainee',
            'employee_number' => 'CDRRMD-004',
        ],
    ];

    public function run(): void
    {
        $department = Department::updateOrCreate(
            ['code' => 'DMS'],
            [
                'name' => 'Dispatch Management Section',
                'description' => 'Responsible for emergency communications and dispatch operations of the Butuan City Integrated Response System.',
                'is_active' => true,
            ]
        );

        $roles = Role::query()->pluck('id', 'name');

        foreach (self::ACCOUNTS as $account) {
            User::updateOrCreate(
                ['email' => $account['email']],
                [
                    'name' => $account['name'],
                    'password' => Hash::make($account['password']),
                    'role_id' => $roles[$account['role']],
                    'department_id' => $department->id,
                    'employee_number' => $account['employee_number'],
                    'is_active' => true,
                ]
            );
        }
    }
}
