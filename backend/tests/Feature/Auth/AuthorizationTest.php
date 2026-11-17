<?php

namespace Tests\Feature\Auth;

use App\Models\Permission;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthorizationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
    }

    /**
     * Sanctum treats a request as stateful (SPA cookie flow) only when
     * its Referer matches a configured stateful domain, so feature
     * tests must mimic the browser by sending the Referer header.
     */
    private function spaReferer(): string
    {
        return rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/').'/';
    }

    /**
     * Register a throwaway API route guarded by the permission
     * middleware, so middleware behavior is tested without coupling
     * to any real business module.
     */
    private function registerPermissionRoute(string ...$permissions): void
    {
        $this->app->get('router')->get('/api/v1/_permission-check', function () {
            return response()->json(['success' => true]);
        })->middleware(['auth:sanctum', 'permission:'.implode(',', $permissions)]);
    }

    private function registerRoleRoute(string ...$roles): void
    {
        $this->app->get('router')->get('/api/v1/_role-check', function () {
            return response()->json(['success' => true]);
        })->middleware(['auth', 'role:'.implode(',', $roles)]);
    }

    private function user(string $email): User
    {
        return User::query()->where('email', $email)->first();
    }

    public function test_administrator_passes_permission_middleware(): void
    {
        $this->registerPermissionRoute('trainees.view');

        $response = $this->actingAs($this->user('admin@cdrrmd.gov.ph'))
            ->withHeader('Referer', $this->spaReferer())
            ->getJson('/api/v1/_permission-check');

        $response->assertOk();
    }

    public function test_supervisor_passes_permission_middleware_via_pivot(): void
    {
        $this->registerPermissionRoute('trainees.view', 'trainees.update');

        $response = $this->actingAs($this->user('supervisor@cdrrmd.gov.ph'))
            ->withHeader('Referer', $this->spaReferer())
            ->getJson('/api/v1/_permission-check');

        $response->assertOk();
    }

    public function test_user_is_forbidden_from_lacking_permissions(): void
    {
        $this->registerPermissionRoute('users.delete');

        $response = $this->actingAs($this->user('trainee@cdrrmd.gov.ph'))
            ->withHeader('Referer', $this->spaReferer())
            ->getJson('/api/v1/_permission-check');

        $response->assertForbidden()
            ->assertJsonPath('message', 'You do not have permission to perform this action.');
    }

    public function test_permission_middleware_requires_all_permissions(): void
    {
        // Supervisor has trainees.view but not users.delete → forbidden.
        $this->registerPermissionRoute('trainees.view', 'users.delete');

        $response = $this->actingAs($this->user('supervisor@cdrrmd.gov.ph'))
            ->withHeader('Referer', $this->spaReferer())
            ->getJson('/api/v1/_permission-check');

        $response->assertForbidden();
    }

    public function test_permission_middleware_rejects_unauthenticated_requests(): void
    {
        $this->registerPermissionRoute('trainees.view');

        $this->withHeader('Referer', $this->spaReferer())
            ->getJson('/api/v1/_permission-check')
            ->assertUnauthorized();
    }

    public function test_role_middleware_allows_matching_roles(): void
    {
        $this->registerRoleRoute('training_supervisor', 'trainer');

        $this->actingAs($this->user('supervisor@cdrrmd.gov.ph'))
            ->get('/api/v1/_role-check')
            ->assertOk();

        $this->actingAs($this->user('trainer@cdrrmd.gov.ph'))
            ->get('/api/v1/_role-check')
            ->assertOk();

        $this->actingAs($this->user('trainee@cdrrmd.gov.ph'))
            ->get('/api/v1/_role-check')
            ->assertForbidden();
    }

    public function test_user_model_permission_helpers(): void
    {
        $supervisor = $this->user('supervisor@cdrrmd.gov.ph');
        $trainee = $this->user('trainee@cdrrmd.gov.ph');
        $admin = $this->user('admin@cdrrmd.gov.ph');

        // Supervisor's matrix
        $this->assertTrue($supervisor->hasRole('training_supervisor'));
        $this->assertFalse($supervisor->hasRole('trainer'));
        $this->assertTrue($supervisor->hasPermission('trainees.view', 'trainees.update'));
        $this->assertFalse($supervisor->hasPermission('trainees.view', 'users.delete'));
        $this->assertTrue($supervisor->hasAnyPermission('users.delete', 'trainees.view'));

        // Trainee's restricted matrix
        $this->assertFalse($trainee->hasPermission('trainees.view'));
        $this->assertTrue($trainee->hasPermission('self.view'));
        $this->assertFalse($trainee->hasAnyPermission('users.view', 'reports.export'));

        // Administrator implicit wildcard
        $this->assertTrue($admin->hasPermission('anything.at.all'));
        $this->assertTrue($admin->hasAnyPermission('anything.at.all'));

        // Seeders created every role and permission consistently
        $this->assertEquals(4, \App\Models\Role::count());
        $this->assertEquals(29, Permission::count());
    }
}
