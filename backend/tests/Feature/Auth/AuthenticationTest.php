<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
        $this->admin = User::query()->where('email', 'admin@cdrrmd.gov.ph')->first();
    }

    public function test_health_endpoint_is_public(): void
    {
        $response = $this->getJson('/api/v1/health');

        $response->assertOk()->assertJsonPath('success', true);
    }

    public function test_login_success_returns_user_and_sets_session(): void
    {
        $response = $this
            ->withHeader('Referer', $this->spaReferer())
            ->postJson('/api/v1/auth/login', [
                'email' => 'admin@cdrrmd.gov.ph',
                'password' => 'Admin@2024',
            ]);

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.email', 'admin@cdrrmd.gov.ph')
            ->assertJsonPath('data.role.name', 'super_admin');

        $this->assertAuthenticatedAs($this->admin);

        $response->assertCookie(session()->getName());
        $response->assertCookieNotExpired(session()->getName());
    }

    public function test_login_failure_returns_validation_error(): void
    {
        $response = $this
            ->withHeader('Referer', $this->spaReferer())
            ->postJson('/api/v1/auth/login', [
                'email' => 'admin@cdrrmd.gov.ph',
                'password' => 'wrong-password',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);

        $this->assertGuest();
    }

    public function test_login_requires_email_and_password(): void
    {
        $response = $this->postJson('/api/v1/auth/login', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email', 'password']);
    }

    public function test_login_rejects_deactivated_accounts(): void
    {
        $this->admin->update(['is_active' => false]);

        $response = $this
            ->withHeader('Referer', $this->spaReferer())
            ->postJson('/api/v1/auth/login', [
                'email' => 'admin@cdrrmd.gov.ph',
                'password' => 'Admin@2024',
            ]);

        $response->assertStatus(422);

        $this->assertGuest();

        $this->admin->refresh();
        $this->assertNull($this->admin->last_login_at);
    }

    public function test_login_is_rate_limited(): void
    {
        $payload = ['email' => 'admin@cdrrmd.gov.ph', 'password' => 'wrong-password'];

        for ($i = 0; $i < 5; $i++) {
            $this->postJson('/api/v1/auth/login', $payload);
        }

        $response = $this
            ->withHeader('Referer', $this->spaReferer())
            ->postJson('/api/v1/auth/login', $payload);

        $response->assertStatus(429);
    }

    public function test_me_endpoint_is_protected(): void
    {
        $this->getJson('/api/v1/auth/me')->assertUnauthorized();
    }

    public function test_me_returns_role_and_permissions(): void
    {
        $response = $this
            ->withHeader('Referer', $this->spaReferer())
            ->postJson('/api/v1/auth/login', [
                'email' => 'admin@cdrrmd.gov.ph',
                'password' => 'Admin@2024',
            ]);

        $response = $this
            ->withHeader('Referer', $this->spaReferer())
            ->getJson('/api/v1/auth/me');

        $response->assertOk()
            ->assertJsonPath('data.email', 'admin@cdrrmd.gov.ph')
            ->assertJsonPath('data.role.name', 'super_admin');

        $permissions = $response->json('data.permissions');
        $this->assertNotEmpty($permissions);
        $this->assertContains('users.view', $permissions);
        $this->assertContains('reports.export', $permissions);
    }

    public function test_me_updates_last_login(): void
    {
        $this->withHeader('Referer', $this->spaReferer())
            ->postJson('/api/v1/auth/login', [
                'email' => 'admin@cdrrmd.gov.ph',
                'password' => 'Admin@2024',
            ]);

        $this->admin->refresh();
        $this->assertNotNull($this->admin->last_login_at);
    }

    public function test_logout_ends_the_session(): void
    {
        $this->withHeader('Referer', $this->spaReferer())
            ->postJson('/api/v1/auth/login', [
                'email' => 'admin@cdrrmd.gov.ph',
                'password' => 'Admin@2024',
            ]);

        $this->assertAuthenticatedAs($this->admin);

        $this->withHeader('Referer', $this->spaReferer())
            ->postJson('/api/v1/auth/logout')
            ->assertOk()
            ->assertJsonPath('success', true);

        // Feature tests reuse one container across requests, so cached
        // guard instances hold a stale session-store reference. Reset
        // them before the in-process check; the behavioral check below
        // (a fresh request hitting /auth/me) is authoritative.
        $this->app['auth']->forgetGuards();

        $this->assertGuest();

        $this->withHeader('Referer', $this->spaReferer())
            ->getJson('/api/v1/auth/me')
            ->assertUnauthorized();
    }

    public function test_login_attempts_are_audited(): void
    {
        $this->withHeader('Referer', $this->spaReferer())
            ->postJson('/api/v1/auth/login', [
                'email' => 'admin@cdrrmd.gov.ph',
                'password' => 'Admin@2024',
            ]);

        $this->withHeader('Referer', $this->spaReferer())
            ->postJson('/api/v1/auth/login', [
                'email' => 'admin@cdrrmd.gov.ph',
                'password' => 'wrong-password',
            ]);

        $this->assertDatabaseHas('audit_logs', ['action' => 'auth.login']);
        $this->assertDatabaseHas('audit_logs', ['action' => 'auth.login_failed']);
    }

    /**
     * The frontend origin used by the SPA flow.
     */
    private function spaReferer(): string
    {
        return rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/').'/';
    }
}
