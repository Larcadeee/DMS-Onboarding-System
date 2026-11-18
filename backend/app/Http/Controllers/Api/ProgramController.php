<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Program;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\Builder;

class ProgramController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Program::query();

        // Search
        if ($request->filled('search')) {
            $search = $request->string('search');
            $query->where(function (Builder $q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }

        // Status filter
        if ($request->filled('status')) {
            $query->where('status', $request->string('status'));
        }

        // Sorting
        $sortBy = $request->string('sort_by', 'created_at');
        $sortDir = $request->string('sort_dir', 'desc');
        $allowedSorts = ['title', 'code', 'status', 'created_at', 'start_date', 'end_date'];
        if (in_array($sortBy, $allowedSorts)) {
            $query->orderBy($sortBy, $sortDir);
        }

        $perPage = min($request->integer('per_page', 15), 100);
        $programs = $query->with('department')->paginate($perPage);

        return response()->json([
            'success' => true,
            'message' => 'Programs retrieved successfully.',
            'data' => $programs,
            'meta' => null,
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => 'nullable|exists:departments,id',
            'title' => 'required|string|max:200',
            'code' => 'required|string|max:30|unique:programs,code',
            'description' => 'nullable|string',
            'total_hours' => 'nullable|integer|min:0',
            'status' => 'nullable|in:draft,published,archived',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $program = Program::create($validated);

        return response()->json([
            'success' => true,
            'message' => 'Program created successfully.',
            'data' => $program->load('department'),
            'meta' => null,
        ], 201);
    }

    public function show(Program $program): JsonResponse
    {
        $program->load(['department', 'modules', 'trainees']);

        return response()->json([
            'success' => true,
            'message' => 'Program retrieved successfully.',
            'data' => $program,
            'meta' => null,
        ]);
    }

    public function update(Request $request, Program $program): JsonResponse
    {
        $validated = $request->validate([
            'department_id' => 'nullable|exists:departments,id',
            'title' => 'sometimes|required|string|max:200',
            'code' => 'sometimes|required|string|max:30|unique:programs,code,' . $program->id,
            'description' => 'nullable|string',
            'total_hours' => 'nullable|integer|min:0',
            'status' => 'nullable|in:draft,published,archived',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $program->update($validated);

        return response()->json([
            'success' => true,
            'message' => 'Program updated successfully.',
            'data' => $program->load('department'),
            'meta' => null,
        ]);
    }

    public function destroy(Program $program): JsonResponse
    {
        $program->delete();

        return response()->json([
            'success' => true,
            'message' => 'Program deleted successfully.',
            'data' => null,
            'meta' => null,
        ]);
    }
}
