<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Route middleware alias: `role:super_admin,training_supervisor`.
 * Allows the request only when the authenticated user's role name
 * matches at least one of the given roles.
 */
class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        $user = $request->user();

        if ($user === null) {
            abort(401, 'Unauthenticated.');
        }

        if (! $user->hasRole(...$roles)) {
            abort(403, 'This action is not authorized for your role.');
        }

        return $next($request);
    }
}
