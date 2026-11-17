<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\AssessmentResult;
use App\Models\AuditLog;
use App\Models\ProgramEnrollment;
use App\Models\Schedule;
use App\Models\Trainee;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

/**
 * Role-aware dashboard statistics.
 *
 * super_admin / training_supervisor → organization-wide statistics.
 * trainer → statistics for the sessions they conduct.
 * trainee → personal onboarding progress.
 */
class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        /** @var \App\Models\User $user */
        $user = $request->user();

        $payload = match (true) {
            $user->hasRole('super_admin', 'training_supervisor') => $this->organizationStats(),
            $user->hasRole('trainer') => $this->trainerStats($user->id),
            default => $this->traineeStats($user),
        };

        return response()->json([
            'success' => true,
            'message' => 'Dashboard statistics.',
            'data' => $payload,
            'meta' => null,
        ]);
    }

    /**
     * Organization-wide statistics (administrators and supervisors).
     *
     * @return array<string, mixed>
     */
    private function organizationStats(): array
    {
        $enrollmentCounts = ProgramEnrollment::query()
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        return [
            'perspective' => 'organization',
            'stats' => [
                'active_trainees' => Trainee::query()->where('status', 'active')->count(),
                'ongoing_programs' => (int) ($enrollmentCounts['in_progress'] ?? 0),
                'completed_programs' => (int) ($enrollmentCounts['completed'] ?? 0),
                'pending_assessments' => AssessmentResult::query()->where('result', 'pending')->count(),
            ],
            'completion' => [
                'enrolled' => (int) ($enrollmentCounts['enrolled'] ?? 0),
                'in_progress' => (int) ($enrollmentCounts['in_progress'] ?? 0),
                'completed' => (int) ($enrollmentCounts['completed'] ?? 0),
                'dropped' => (int) ($enrollmentCounts['dropped'] ?? 0),
            ],
            'upcoming_sessions' => $this->upcomingSessions(),
            'recent_activity' => $this->recentActivity(),
        ];
    }

    /**
     * Statistics for the sessions a trainer conducts.
     *
     * @return array<string, mixed>
     */
    private function trainerStats(int $trainerId): array
    {
        return [
            'perspective' => 'trainer',
            'stats' => [
                'assigned_trainees' => Trainee::query()->where('status', 'active')->count(),
                'upcoming_sessions' => Schedule::query()
                    ->where('trainer_id', $trainerId)
                    ->where('starts_at', '>=', now())
                    ->where('status', 'scheduled')
                    ->count(),
                'completed_sessions' => Schedule::query()
                    ->where('trainer_id', $trainerId)
                    ->where('status', 'done')
                    ->count(),
                'pending_assessments' => AssessmentResult::query()
                    ->where('result', 'pending')
                    ->whereHas('assessment.module.schedules', fn ($q) => $q->where('trainer_id', $trainerId))
                    ->count(),
            ],
            'completion' => null,
            'upcoming_sessions' => $this->upcomingSessions($trainerId),
            'recent_activity' => $this->recentActivity(),
        ];
    }

    /**
     * Personal onboarding progress for a trainee user.
     *
     * @return array<string, mixed>
     */
    private function traineeStats(\App\Models\User $user): array
    {
        $trainee = Trainee::query()->where('user_id', $user->id)->first();

        if ($trainee === null) {
            return [
                'perspective' => 'trainee',
                'stats' => null,
                'completion' => null,
                'upcoming_sessions' => [],
                'recent_activity' => [],
            ];
        }

        $enrollmentCounts = ProgramEnrollment::query()
            ->where('trainee_id', $trainee->id)
            ->select('status', DB::raw('count(*) as total'))
            ->groupBy('status')
            ->pluck('total', 'status');

        $resultCounts = AssessmentResult::query()
            ->where('trainee_id', $trainee->id)
            ->select('result', DB::raw('count(*) as total'))
            ->groupBy('result')
            ->pluck('total', 'result');

        return [
            'perspective' => 'trainee',
            'trainee' => [
                'id' => $trainee->id,
                'name' => trim("{$trainee->first_name} {$trainee->last_name}"),
                'trainee_number' => $trainee->trainee_number,
                'status' => $trainee->status,
            ],
            'stats' => [
                'ongoing_programs' => (int) ($enrollmentCounts['in_progress'] ?? 0),
                'completed_programs' => (int) ($enrollmentCounts['completed'] ?? 0),
                'assessments_passed' => (int) ($resultCounts['passed'] ?? 0),
                'assessments_pending' => (int) ($resultCounts['pending'] ?? 0),
            ],
            'completion' => [
                'enrolled' => (int) ($enrollmentCounts['enrolled'] ?? 0),
                'in_progress' => (int) ($enrollmentCounts['in_progress'] ?? 0),
                'completed' => (int) ($enrollmentCounts['completed'] ?? 0),
                'dropped' => (int) ($enrollmentCounts['dropped'] ?? 0),
            ],
            'upcoming_sessions' => $this->traineeUpcomingSessions($trainee->id),
            'recent_activity' => [],
        ];
    }

    /**
     * Next five scheduled sessions, optionally scoped to one trainer.
     *
     * @return array<int, array<string, mixed>>
     */
    private function upcomingSessions(?int $trainerId = null): array
    {
        return Schedule::query()
            ->with(['module:id,title,program_id', 'trainer:id,name'])
            ->where('starts_at', '>=', now())
            ->where('status', 'scheduled')
            ->when($trainerId !== null, fn ($q) => $q->where('trainer_id', $trainerId))
            ->orderBy('starts_at')
            ->limit(5)
            ->get()
            ->map(fn (Schedule $schedule) => [
                'id' => $schedule->id,
                'module_title' => $schedule->module->title,
                'trainer' => $schedule->trainer?->name,
                'starts_at' => $schedule->starts_at->toIso8601String(),
                'ends_at' => $schedule->ends_at->toIso8601String(),
                'location' => $schedule->location,
                'status' => $schedule->status,
            ])
            ->all();
    }

    /**
     * Next five sessions a trainee is expected to attend, resolved
     * through their attendance records.
     *
     * @return array<int, array<string, mixed>>
     */
    private function traineeUpcomingSessions(int $traineeId): array
    {
        return Schedule::query()
            ->join('modules', 'modules.id', '=', 'schedules.module_id')
            ->join('programs', 'programs.id', '=', 'modules.program_id')
            ->join('program_enrollments', 'program_enrollments.program_id', '=', 'programs.id')
            ->leftJoin('users', 'users.id', '=', 'schedules.trainer_id')
            ->where('program_enrollments.trainee_id', $traineeId)
            ->where('schedules.starts_at', '>=', now())
            ->where('schedules.status', 'scheduled')
            ->orderBy('schedules.starts_at')
            ->limit(5)
            ->get([
                'schedules.id',
                'schedules.starts_at',
                'schedules.ends_at',
                'schedules.location',
                'schedules.status',
                'modules.title as module_title',
                'users.name as trainer_name',
            ])
            ->map(fn ($row) => [
                'id' => $row->id,
                'module_title' => $row->module_title ?? '—',
                'trainer' => $row->trainer_name,
                'starts_at' => $row->starts_at->toIso8601String(),
                'ends_at' => $row->ends_at->toIso8601String(),
                'location' => $row->location,
                'status' => $row->status,
            ])
            ->all();
    }

    /**
     * Latest audit trail entries for the activity feed.
     *
     * @return array<int, array<string, mixed>>
     */
    private function recentActivity(): array
    {
        return AuditLog::query()
            ->with('user:id,name')
            ->orderByDesc('created_at')
            ->limit(8)
            ->get()
            ->map(fn (AuditLog $log) => [
                'id' => $log->id,
                'action' => $log->action,
                'user' => $log->user?->name,
                'created_at' => $log->created_at->toIso8601String(),
            ])
            ->all();
    }
}
