<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Program;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application database.
     */
    public function run(): void
    {
        // Seed roles and permissions first
        $this->call(RolePermissionSeeder::class);

        // Create default department
        $department = Department::firstOrCreate(
            ['code' => 'CDRRMD'],
            [
                'name' => 'City Disaster Risk Reduction and Management Department',
                'description' => 'Butuan City DRRMD',
                'is_active' => true,
            ]
        );

        // Get the super_admin role
        $superAdminRole = Role::where('name', 'super_admin')->first();

        // Create System Administrator
        User::firstOrCreate(
            ['email' => 'admin@cdrrmd.gov.ph'],
            [
                'name' => 'System Administrator',
                'email' => 'admin@cdrrmd.gov.ph',
                'password' => Hash::make('password123'),
                'role_id' => $superAdminRole?->id,
                'department_id' => $department->id,
                'employee_number' => 'ADM-0001',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create Training Supervisor
        $trainingSupervisorRole = Role::where('name', 'training_supervisor')->first();
        User::firstOrCreate(
            ['email' => 'supervisor@cdrrmd.gov.ph'],
            [
                'name' => 'Training Supervisor',
                'email' => 'supervisor@cdrrmd.gov.ph',
                'password' => Hash::make('password123'),
                'role_id' => $trainingSupervisorRole?->id,
                'department_id' => $department->id,
                'employee_number' => 'SUP-0001',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create Trainer
        $trainerRole = Role::where('name', 'trainer')->first();
        User::firstOrCreate(
            ['email' => 'trainer@cdrrmd.gov.ph'],
            [
                'name' => 'Trainer Evaluator',
                'email' => 'trainer@cdrrmd.gov.ph',
                'password' => Hash::make('password123'),
                'role_id' => $trainerRole?->id,
                'department_id' => $department->id,
                'employee_number' => 'TRN-0001',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        // Create Trainee
        $traineeRole = Role::where('name', 'trainee')->first();
        User::firstOrCreate(
            ['email' => 'trainee@cdrrmd.gov.ph'],
            [
                'name' => 'Trainee User',
                'email' => 'trainee@cdrrmd.gov.ph',
                'password' => Hash::make('password123'),
                'role_id' => $traineeRole?->id,
                'department_id' => $department->id,
                'employee_number' => 'TRN-0002',
                'is_active' => true,
                'email_verified_at' => now(),
            ]
        );

        $this->command->info('Default users created successfully.');
        $this->command->info('Login credentials:');
        $this->command->info('  Admin: admin@cdrrmd.gov.ph / password123');
        $this->command->info('  Supervisor: supervisor@cdrrmd.gov.ph / password123');
        $this->command->info('  Trainer: trainer@cdrrmd.gov.ph / password123');
        $this->command->info('  Trainee: trainee@cdrrmd.gov.ph / password123');

        // Create sample programs
        $programs = [
            [
                'department_id' => $department->id,
                'title' => 'Basic Incident Command System (ICS)',
                'code' => 'ICS-100',
                'description' => 'Fundamentals of Incident Command System for emergency response operations.',
                'total_hours' => 16,
                'status' => 'published',
                'start_date' => '2026-01-15',
                'end_date' => '2026-01-16',
            ],
            [
                'department_id' => $department->id,
                'title' => 'Community-Based Disaster Risk Reduction',
                'code' => 'CBDRR-201',
                'description' => 'Comprehensive training on community-based approaches to disaster risk reduction and management.',
                'total_hours' => 24,
                'status' => 'published',
                'start_date' => '2026-02-01',
                'end_date' => '2026-02-03',
            ],
            [
                'department_id' => $department->id,
                'title' => 'Emergency Operations Center Management',
                'code' => 'EOC-301',
                'description' => 'Advanced training on EOC operations, coordination, and decision-making during disasters.',
                'total_hours' => 32,
                'status' => 'draft',
                'start_date' => '2026-03-10',
                'end_date' => '2026-03-13',
            ],
            [
                'department_id' => $department->id,
                'title' => 'Rapid Damage Assessment and Needs Analysis',
                'code' => 'RDANA-101',
                'description' => 'Quick assessment techniques for post-disaster damage and needs evaluation.',
                'total_hours' => 16,
                'status' => 'published',
                'start_date' => '2026-04-05',
                'end_date' => '2026-04-06',
            ],
            [
                'department_id' => $department->id,
                'title' => 'Search and Rescue Operations',
                'code' => 'SAR-201',
                'description' => 'Basic search and rescue techniques for urban and rural environments.',
                'total_hours' => 40,
                'status' => 'archived',
                'start_date' => '2025-11-20',
                'end_date' => '2025-11-24',
            ],
        ];

        foreach ($programs as $programData) {
            Program::firstOrCreate(
                ['code' => $programData['code']],
                $programData
            );
        }

        $this->command->info('Sample programs created successfully.');
    }
}