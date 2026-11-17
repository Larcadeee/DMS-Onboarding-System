<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasPermission
{
    public function handle(Request $request, Closure $next, string ...$permissions): Response
    {
        $user = Auth::user();

        if (! $user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthenticated.',
                'data' => null,
                'meta' => null,
            ], 401);
        }

        if (! $user->is_active) {
            return response()->json([
                'success' => false,
                'message' => 'Your account has been deactivated.',
                'data' => null,
                'meta' => null,
            ], 403);
        }

        if (! $user->role) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have a role assigned.',
                'data' => null,
                'meta' => null,
            ], 403);
        }

        $userPermissions = $user->role->permissions->pluck('name')->toArray();

        $hasPermission = false;
        foreach ($permissions as $permission) {
            if (in_array($permission, $userPermissions, true)) {
                $hasPermission = true;
                break;
            }
        }

        if (! $hasPermission) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have the required permission to access this resource.',
                'data' => null,
                'meta' => null,
            ], 403);
        }

        return $next($request);
    }
}