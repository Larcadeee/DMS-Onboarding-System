<?php

namespace Database\Seeders;

use App\Models\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    /**
     * System roles. `name` is the stable machine identifier used in
     * code and middleware; `label` is the display name.
     */
    public const ROLES = [
        [
            'name' => 'super_admin',
            'label' => 'System Administrator',
            'description' => 'Full access to system configuration, user management, training management, and system records.',
        ],
        [
            'name' => 'training_supervisor',
            'label' => 'Training Supervisor',
            'description' => 'Oversees onboarding programs, monitors trainee progress, reviews assessments, and approves training completion.',
        ],
        [
            'name' => 'trainer',
            'label' => 'Trainer / Evaluator',
            'description' => 'Manages assigned training sessions, records attendance, conducts assessments, and submits trainee evaluations.',
        ],
        [
            'name' => 'trainee',
            'label' => 'Emergency Telecommunicator (Trainee)',
            'description' => 'Views assigned onboarding modules, training schedules, learning materials, assessment results, and personal progress.',
        ],
    ];

    public function run(): void
    {
        foreach (self::ROLES as $role) {
            Role::updateOrCreate(['name' => $role['name']], $role);
        }
    }
}
