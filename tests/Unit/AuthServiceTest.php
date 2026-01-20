<?php

namespace Tests\Unit;

use App\Domains\Auth\Services\AuthService;
use App\Domains\Organization\Models\Organization;
use App\Domains\User\Models\User;
use App\Domains\Permission\Models\Role;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthServiceTest extends TestCase
{
    use RefreshDatabase;

    protected AuthService $authService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->authService = new AuthService();
    }

    #[Test]
    public function it_can_register_a_new_user_with_organization()
    {
        $data = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'organization_name' => 'Test Organization',
        ];

        $result = $this->authService->register($data);

        $this->assertInstanceOf(User::class, $result['user']);
        $this->assertInstanceOf(Organization::class, $result['organization']);
        $this->assertNotEmpty($result['token']);
        $this->assertEquals('Test User', $result['user']->name);
        $this->assertEquals('test@example.com', $result['user']->email);
        $this->assertEquals('Test Organization', $result['organization']->name);
    }

    #[Test]
    public function it_creates_owner_role_for_new_organization()
    {
        $data = [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password123',
            'password_confirmation' => 'password123',
            'organization_name' => 'Test Organization',
        ];

        $result = $this->authService->register($data);

        $ownerRole = Role::where('organization_id', $result['organization']->id)
            ->where('slug', 'owner')
            ->first();

        $this->assertNotNull($ownerRole);
        $this->assertTrue($ownerRole->is_system);
    }

    #[Test]
    public function it_can_login_user_with_valid_credentials()
    {
        $user = User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $organization = Organization::factory()->create();
        $user->current_organization_id = $organization->id;
        $user->save();
        $organization->users()->attach($user->id);

        $result = $this->authService->login('test@example.com', 'password123');

        $this->assertInstanceOf(User::class, $result['user']);
        $this->assertNotEmpty($result['token']);
        $this->assertEquals('test@example.com', $result['user']->email);
    }

    #[Test]
    public function it_throws_exception_for_invalid_login_credentials()
    {
        User::factory()->create([
            'email' => 'test@example.com',
            'password' => Hash::make('password123'),
        ]);

        $this->expectException(\Illuminate\Validation\ValidationException::class);

        $this->authService->login('test@example.com', 'wrongpassword');
    }

    #[Test]
    public function it_can_logout_user()
    {
        $user = User::factory()->create();
        $tokenResult = $user->createToken('test-token');
        $token = $tokenResult->accessToken;

        $this->assertDatabaseHas('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'id' => $token->id,
        ]);

        // Simulate authenticated request context by setting the token on the user
        // In a real request, Sanctum sets this automatically via middleware
        $user->withAccessToken($token);

        $this->authService->logout($user);

        $this->assertDatabaseMissing('personal_access_tokens', [
            'tokenable_id' => $user->id,
            'id' => $token->id,
        ]);
    }

    #[Test]
    public function it_returns_authenticated_user_with_organization()
    {
        $organization = Organization::factory()->create();
        $user = User::factory()->create([
            'current_organization_id' => $organization->id,
        ]);
        $organization->users()->attach($user->id);

        $result = $this->authService->getAuthenticatedUser($user);

        $this->assertInstanceOf(User::class, $result['user']);
        $this->assertInstanceOf(Organization::class, $result['organization']);
        $this->assertEquals($organization->id, $result['organization']->id);
    }
}
