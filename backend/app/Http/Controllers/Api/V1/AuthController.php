<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * Authenticate a user and start a cookie-based session
     * (Sanctum SPA authentication flow).
     */
    public function login(LoginRequest $request): JsonResponse
    {
        $credentials = $request->only('email', 'password');

        if (! Auth::attempt($credentials)) {
            AuditLogger::log('auth.login_failed', null, null, [
                'email' => $request->input('email'),
            ]);

            throw ValidationException::withMessages([
                'email' => ['These credentials do not match our records.'],
            ]);
        }

        $user = Auth::user();

        if (! $user->is_active) {
            Auth::guard('web')->logout();

            AuditLogger::log('auth.login_blocked', $user, null, [
                'reason' => 'account_deactivated',
            ]);

            throw ValidationException::withMessages([
                'email' => ['Your account has been deactivated. Please contact the system administrator.'],
            ]);
        }

        // Rotate the session identifier to prevent session fixation.
        $request->session()->regenerate();

        $user->forceFill(['last_login_at' => now()])->save();

        AuditLogger::log('auth.login', $user);

        return $this->respondWithUser($user, 'Login successful.');
    }

    /**
     * Return the authenticated user with role and permissions.
     */
    public function me(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return $this->respondWithUser($user, 'Session is valid.');
    }

    /**
     * End the session and invalidate the cookie.
     */
    public function logout(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        AuditLogger::log('auth.logout', $user);

        Auth::guard('web')->logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'success' => true,
            'message' => 'Logged out successfully.',
            'data' => null,
            'meta' => null,
        ]);
    }

    /**
     * Build the standard API envelope around the user payload.
     */
    private function respondWithUser(User $user, string $message): JsonResponse
    {
        $user->loadMissing('role.permissions', 'department');

        return response()->json([
            'success' => true,
            'message' => $message,
            'data' => UserResource::make($user)->resolve(),
            'meta' => null,
        ]);
    }
}
