<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\DashboardController;
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

    /*
    |--------------------------------------------------------------------------
    | Authentication (Sanctum SPA cookie flow)
    |--------------------------------------------------------------------------
    */
    Route::prefix('auth')->group(function () {
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware('throttle:login');

        Route::middleware('auth:sanctum')->group(function () {
            Route::get('/me', [AuthController::class, 'me']);
            Route::post('/logout', [AuthController::class, 'logout']);
        });
    });

    /*
    |--------------------------------------------------------------------------
    | Dashboard
    |--------------------------------------------------------------------------
    | The payload adapts to the caller's role (organization-wide,
    | trainer-scoped, or personal trainee progress).
    */
    Route::get('/dashboard/stats', [DashboardController::class, 'stats'])
        ->middleware('auth:sanctum');
});
