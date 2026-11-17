<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Trainee;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Database\Eloquent\Builder;

class TraineeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Trainee::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function (Builder $q) use ($search) {
                $q->where('first_name', 'like', "%{$search}%")
                    ->orWhere('last_name', 'like', "%{$search}%")
                    ->orWhere('trainee_number', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        // Sorting
        $sortBy = $request->string('sort_by', 'last_name');
        $sortDir = $request->string('sort_dir', 'asc');
        $allowedSorts = ['first_name', 'last_name', 'trainee_number', 'email', 'status', 'created_at'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        }

        $perPage = min($request->integer('per_page', 15), 100);
        $trainees = $query->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Trainees retrieved successfully.',
            'data' => $trainees,
            'meta' => null,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id|unique:trainees,user_id',
            'trainee_number' => 'required|string|max:30|unique:trainees,trainee_number',
            'first_name' => 'required|string|max:100',
            'last_name' => 'required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255|unique:trainees,email',
            'phone' => 'nullable|string|max:30',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'barangay' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:active,inactive,completed,withdrawn',
        ]);

        $trainee = Trainee::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Trainee created successfully.',
            'data' => $trainee->load('user'),
            'meta' => null,
        ], 201);
    }

    public function show(Trainee $trainee): JsonResponse
    {
        $trainee->load([
            'user',
            'enrollments.program',
            'competencies',
            'assessmentResults.assessment',
            'attendanceRecords.schedule',
        ]);

        return response()->json([
            'success' => true,
            'message' => 'Trainee retrieved successfully.',
            'data' => $trainee,
            'meta' => null,
        ]);
    }

    public function update(Request $request, Trainee $trainee): JsonResponse
    {
        $validated = $request->validate([
            'user_id' => 'nullable|exists:users,id|unique:trainees,user_id,' . $trainee->id,
            'trainee_number' => 'sometimes|required|string|max:30|unique:trainees,trainee_number,' . $trainee->id,
            'first_name' => 'sometimes|required|string|max:100',
            'last_name' => 'sometimes|required|string|max:100',
            'middle_name' => 'nullable|string|max:100',
            'email' => 'nullable|email|max:255|unique:trainees,email,' . $trainee->id,
            'phone' => 'nullable|string|max:30',
            'date_of_birth' => 'nullable|date',
            'gender' => 'nullable|string|max:20',
            'address' => 'nullable|string',
            'barangay' => 'nullable|string|max:100',
            'status' => 'nullable|string|in:active,inactive,completed,withdrawn',
        ]);

        $trainee->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Trainee updated successfully.',
            'data' => $trainee->load('user'),
            'meta' => null,
        ]);
    }

    public function destroy(Trainee $trainee): JsonResponse
    {
        $trainee->delete();

        return response()->json([
            'success' => true,
            'message' => 'Trainee deleted successfully.',
            'data' => null,
            'meta' => null,
        ]);
    }
}