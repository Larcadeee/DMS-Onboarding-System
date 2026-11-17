<?php

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
});