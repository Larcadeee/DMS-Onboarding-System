<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
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

        if (! $user->role || ! in_array($user->role->name, $roles, true)) {
            return response()->json([
                'success' => false,
                'message' => 'You do not have the required role to access this resource.',
                'data' => null,
                'meta' => null,
            ], 403);
        }

        return $next($request);
    }
}