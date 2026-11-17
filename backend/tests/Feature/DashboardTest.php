<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class DashboardTest extends TestCase
{
    use RefreshDatabase;

    private string $referer;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed();
        $this->referer = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/').'/';
    }

    private function login(string $email, string $password): void
    {
        $this->withHeader('Referer', $this->referer)
            ->postJson('/api/v1/auth/login', ['email' => $email, 'password' => $password])
            ->assertOk();
    }

    public function test_stats_require_authentication(): void
    {
        $this->getJson('/api/v1/dashboard/stats')->assertUnauthorized();
    }

    public function test_administrator_sees_organization_statistics(): void
    {
        $this->login('admin@cdrrmd.gov.ph', 'Admin@2024');

        $response = $this->withHeader('Referer', $this->referer)
            ->getJson('/api/v1/dashboard/stats');

        $response->assertOk()
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.perspective', 'organization');

        $stats = $response->json('data.stats');
        $this->assertEquals(4, $stats['active_trainees']);
        $this->assertEquals(3, $stats['ongoing_programs']);
        $this->assertArrayHasKey('completed_programs', $stats);
        $this->assertArrayHasKey('pending_assessments', $stats);

        $completion = $response->json('data.completion');
        $this->assertEquals(3, $completion['in_progress']);
        $this->assertEquals(2, $completion['enrolled']);

        $this->assertCount(3, $response->json('data.upcoming_sessions'));
        $this->assertNotEmpty($response->json('data.recent_activity'));
    }

    public function test_trainer_sees_trainer_statistics(): void
    {
        $this->login('trainer@cdrrmd.gov.ph', 'Trainer@2024');

        $response = $this->withHeader('Referer', $this->referer)
            ->getJson('/api/v1/dashboard/stats');

        $response->assertOk()
            ->assertJsonPath('data.perspective', 'trainer');

        $stats = $response->json('data.stats');
        $this->assertEquals(4, $stats['assigned_trainees']);
        $this->assertEquals(3, $stats['upcoming_sessions']);
        $this->assertEquals(2, $stats['completed_sessions']);

        $this->assertCount(3, $response->json('data.upcoming_sessions'));
    }

    public function test_trainee_sees_personal_progress(): void
    {
        $this->login('maria.santos@cdrrmd.gov.ph', 'Trainee@2024');

        $response = $this->withHeader('Referer', $this->referer)
            ->getJson('/api/v1/dashboard/stats');

        $response->assertOk()
            ->assertJsonPath('data.perspective', 'trainee');

        $this->assertEquals('Maria Santos', $response->json('data.trainee.name'));
        $this->assertEquals(1, $response->json('data.stats.ongoing_programs'));
        $this->assertEquals(2, $response->json('data.stats.assessments_passed'));
        $this->assertCount(3, $response->json('data.upcoming_sessions'));
    }

    public function test_trainee_without_trainee_profile_gets_empty_payload(): void
    {
        // The seeded trainee account for authentication exists, but the
        // demo seeder gives it a Trainee profile. Create a fresh trainee-
        // role user without a profile instead.
        $user = User::create([
            'name' => 'Profileless Trainee',
            'email' => 'profileless@cdrrmd.gov.ph',
            'password' => 'Trainee@2024',
            'role_id' => \App\Models\Role::query()->where('name', 'trainee')->value('id'),
        ]);

        $this->withHeader('Referer', $this->referer)
            ->postJson('/api/v1/auth/login', [
                'email' => 'profileless@cdrrmd.gov.ph',
                'password' => 'Trainee@2024',
            ])
            ->assertOk();

        $response = $this->withHeader('Referer', $this->referer)
            ->getJson('/api/v1/dashboard/stats');

        $response->assertOk()
            ->assertJsonPath('data.perspective', 'trainee')
            ->assertJsonPath('data.stats', null);
    }
}
