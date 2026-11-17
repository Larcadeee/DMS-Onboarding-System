<?php

use App\Http\Controllers\Api\Auth\AuthenticatedUserController;
use App\Http\Controllers\Api\Auth\LoginController;
use App\Http\Controllers\Api\Auth\LogoutController;
use App\Http\Controllers\Api\ProgramController;
use App\Http\Controllers\Api\TraineeController;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', function () {
        try {
            DB::connection()->getPdo();
            $dbStatus = 'connected';
            $dbName = DB::connection()->getDatabaseName();
        } catch (\Throwable $e) {
            $dbStatus = 'unreachable';
            $dbName = null;
        }

        return response()->json([
            'success' => $dbStatus === 'connected',
            'message' => 'Health check',
            'data' => [
                'app' => config('app.name'),
                'environment' => config('app.env'),
                'database' => $dbStatus,
                'database_name' => $dbName,
                'timestamp' => now()->toIso8601String(),
            ],
            'meta' => null,
        ], $dbStatus === 'connected' ? 200 : 503);
    });

    // Authentication routes - need web middleware for session/CSRF
    Route::middleware('web')->group(function () {
        Route::post('/login', LoginController::class)->name('login');
        Route::post('/logout', LogoutController::class)->name('logout');

        // Protected routes - use web middleware for session + sanctum auth
        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/user', AuthenticatedUserController::class)->name('user');

            // Test RBAC routes
            Route::get('/test/admin-only', function () {
                return response()->json([
                    'success' => true,
                    'message' => 'Admin access granted.',
                    'data' => ['role' => 'super_admin'],
                    'meta' => null,
                ]);
            })->middleware('role:super_admin');

            Route::get('/test/supervisor-or-admin', function () {
                return response()->json([
                    'success' => true,
                    'message' => 'Supervisor or admin access granted.',
                    'data' => ['roles' => ['super_admin', 'training_supervisor']],
                    'meta' => null,
                ]);
            })->middleware('role:super_admin,training_supervisor');

            Route::get('/test/trainer-permission', function () {
                return response()->json([
                    'success' => true,
                    'message' => 'Trainer permission granted.',
                    'data' => ['permission' => 'assessments.grade'],
                    'meta' => null,
                ]);
            })->middleware('permission:assessments.grade');

            // Trainee Management
            Route::apiResource('trainees', TraineeController::class)
                ->only(['index', 'store', 'show', 'update', 'destroy'])
                ->middleware('permission:trainees.view');

            // Program Management
            Route::apiResource('programs', ProgramController::class)
                ->only(['index', 'store', 'show', 'update', 'destroy'])
                ->middleware('permission:programs.view');
        });
    });
});
