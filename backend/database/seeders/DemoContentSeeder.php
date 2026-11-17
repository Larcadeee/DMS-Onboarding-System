<?php

namespace Database\Seeders;

use App\Models\Assessment;
use App\Models\AssessmentResult;
use App\Models\AttendanceRecord;
use App\Models\Module;
use App\Models\Program;
use App\Models\ProgramEnrollment;
use App\Models\Schedule;
use App\Models\Trainee;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

/**
 * Demo content so the dashboard and later modules have realistic
 * data in local development. Idempotent (updateOrCreate / firstOrCreate).
 *
 * NOTE: seeded automatically in local environments via DatabaseSeeder;
 * never run against production.
 */
class DemoContentSeeder extends Seeder
{
    public function run(): void
    {
        $departmentId = \App\Models\Department::query()->where('code', 'DMS')->value('id');

        $program = Program::updateOrCreate(
            ['code' => 'ETC-ONB-01'],
            [
                'department_id' => $departmentId,
                'title' => 'Emergency Telecommunicator Onboarding Program',
                'description' => 'Structured competency-based onboarding covering organizational orientation, operational familiarization, technical instruction, emergency communications training, practical exercises, supervised deployment, and final competency assessment.',
                'total_hours' => 160,
                'status' => 'published',
                'start_date' => now()->subDays(14)->toDateString(),
                'end_date' => now()->addWeeks(10)->toDateString(),
            ]
        );

        $moduleDefinitions = [
            ['sequence' => 1, 'title' => 'Organizational Orientation', 'duration_hours' => 16],
            ['sequence' => 2, 'title' => 'Operational Familiarization', 'duration_hours' => 24],
            ['sequence' => 3, 'title' => 'Technical Instruction', 'duration_hours' => 32],
            ['sequence' => 4, 'title' => 'Emergency Communications Training', 'duration_hours' => 40],
        ];

        $modules = [];
        foreach ($moduleDefinitions as $definition) {
            $modules[$definition['sequence']] = Module::updateOrCreate(
                ['program_id' => $program->id, 'sequence' => $definition['sequence']],
                [
                    'title' => $definition['title'],
                    'description' => "Phase {$definition['sequence']} of the ETC onboarding program.",
                    'duration_hours' => $definition['duration_hours'],
                ]
            );
        }

        $trainer = User::query()->where('email', 'trainer@cdrrmd.gov.ph')->first();

        $traineeData = [
            ['first_name' => 'Maria', 'last_name' => 'Santos', 'number' => 'ETC-2024-001', 'status' => 'active'],
            ['first_name' => 'Jhonriel', 'last_name' => 'Dela Cruz', 'number' => 'ETC-2024-002', 'status' => 'active'],
            ['first_name' => 'Angelo', 'last_name' => 'Ramos', 'number' => 'ETC-2024-003', 'status' => 'active'],
            ['first_name' => 'Kimberly', 'last_name' => 'Lumbo', 'number' => 'ETC-2024-004', 'status' => 'active'],
            ['first_name' => 'Daryl', 'last_name' => 'Curato', 'number' => 'ETC-2024-005', 'status' => 'inactive'],
        ];

        $trainees = [];
        foreach ($traineeData as $index => $data) {
            $user = User::updateOrCreate(
                ['email' => strtolower("{$data['first_name']}.{$data['last_name']}@cdrrmd.gov.ph")],
                [
                    'name' => "{$data['first_name']} {$data['last_name']}",
                    'password' => Hash::make('Trainee@2024'),
                    'role_id' => \App\Models\Role::query()->where('name', 'trainee')->value('id'),
                    'department_id' => $departmentId,
                    'employee_number' => 'CDRRMD-1'.str_pad((string) ($index + 1), 2, '0', STR_PAD_LEFT),
                    'is_active' => $data['status'] === 'active',
                ]
            );

            $trainees[] = Trainee::updateOrCreate(
                ['trainee_number' => $data['number']],
                [
                    'user_id' => $user->id,
                    'first_name' => $data['first_name'],
                    'last_name' => $data['last_name'],
                    'email' => $user->email,
                    'status' => $data['status'],
                ]
            );

            ProgramEnrollment::updateOrCreate(
                ['trainee_id' => $trainees[$index]->id, 'program_id' => $program->id],
                [
                    'status' => $index < 3 ? 'in_progress' : 'enrolled',
                    'enrolled_on' => now()->subDays(14)->toDateString(),
                ]
            );
        }

        // One past session per module (module 1 done, module 2 done,
        // module 3 ongoing soon) and two upcoming sessions.
        $scheduleDefinitions = [
            ['module' => 1, 'starts' => now()->subDays(10)->setTime(9, 0), 'ends' => now()->subDays(10)->setTime(17, 0), 'status' => 'done', 'location' => 'CDRRMD Training Room'],
            ['module' => 2, 'starts' => now()->subDays(5)->setTime(9, 0), 'ends' => now()->subDays(5)->setTime(17, 0), 'status' => 'done', 'location' => 'CDRRMD Operations Center'],
            ['module' => 3, 'starts' => now()->addDays(2)->setTime(9, 0), 'ends' => now()->addDays(2)->setTime(17, 0), 'status' => 'scheduled', 'location' => 'CDRRMD Operations Center'],
            ['module' => 4, 'starts' => now()->addDays(6)->setTime(9, 0), 'ends' => now()->addDays(6)->setTime(17, 0), 'status' => 'scheduled', 'location' => 'CDRRMD Communications Bay'],
            ['module' => 3, 'starts' => now()->addDays(9)->setTime(13, 0), 'ends' => now()->addDays(9)->setTime(17, 0), 'status' => 'scheduled', 'location' => 'CDRRMD Training Room'],
        ];

        $schedules = [];
        foreach ($scheduleDefinitions as $definition) {
            $schedules[] = Schedule::updateOrCreate(
                [
                    'module_id' => $modules[$definition['module']]->id,
                    'starts_at' => $definition['starts'],
                ],
                [
                    'trainer_id' => $trainer?->id,
                    'ends_at' => $definition['ends'],
                    'location' => $definition['location'],
                    'status' => $definition['status'],
                ]
            );
        }

        // Attendance for the two completed sessions.
        foreach ([0, 1] as $scheduleIndex) {
            foreach ($trainees as $index => $trainee) {
                if ($trainee->status !== 'active') {
                    continue;
                }

                AttendanceRecord::updateOrCreate(
                    [
                        'schedule_id' => $schedules[$scheduleIndex]->id,
                        'trainee_id' => $trainee->id,
                    ],
                    [
                        'status' => $index === 2 ? 'late' : 'present',
                        'checked_in_at' => $schedules[$scheduleIndex]->starts_at,
                        'recorded_by' => $trainer?->id,
                    ]
                );
            }
        }

        // Assessments with a mix of results.
        $assessmentDefinitions = [
            ['module' => 1, 'title' => 'Organizational Orientation Written Exam', 'type' => 'written'],
            ['module' => 2, 'title' => 'Operations Center Familiarization Practical', 'type' => 'practical'],
            ['module' => 3, 'title' => 'CAD Systems Technical Quiz', 'type' => 'quiz'],
        ];

        $scores = [
            [[92.5, 'passed'], [88.0, 'passed'], [76.0, 'passed'], [null, 'pending'], null],
            [[85.0, 'passed'], [70.5, 'failed'], [null, 'pending'], null, null],
            [null, null, null, null, null],
        ];

        foreach ($assessmentDefinitions as $assessmentIndex => $definition) {
            $assessment = Assessment::updateOrCreate(
                [
                    'module_id' => $modules[$definition['module']]->id,
                    'title' => $definition['title'],
                ],
                [
                    'type' => $definition['type'],
                    'max_score' => 100,
                    'passing_score' => 75,
                ]
            );

            foreach ($trainees as $traineeIndex => $trainee) {
                $score = $scores[$assessmentIndex][$traineeIndex] ?? null;
                if ($score === null) {
                    continue;
                }

                AssessmentResult::updateOrCreate(
                    [
                        'assessment_id' => $assessment->id,
                        'trainee_id' => $trainee->id,
                    ],
                    [
                        'score' => $score[0],
                        'result' => $score[1],
                        'graded_by' => $trainer?->id,
                        'graded_at' => $score[0] !== null ? now()->subDays(3) : null,
                    ]
                );
            }
        }
    }
}
