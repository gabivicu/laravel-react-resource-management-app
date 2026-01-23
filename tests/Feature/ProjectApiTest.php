<?php

namespace Tests\Feature;

use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ProjectApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Organization $organization;

    protected string $token;

    protected function setUp(): void
    {
        parent::setUp();

        // Seed permissions and roles
        $this->artisan('db:seed', ['--class' => 'PermissionSeeder']);

        $this->organization = Organization::factory()->create();
        $this->user = User::factory()->create([
            'current_organization_id' => $this->organization->id,
        ]);

        // Attach user to organization with admin role
        $adminRole = \App\Domains\Permission\Models\Role::where('slug', 'admin')->first();
        $this->organization->users()->attach($this->user->id, [
            'role_id' => $adminRole->id,
            'joined_at' => now(),
        ]);

        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    #[Test]
    public function it_can_list_projects()
    {
        Project::factory()->count(5)->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/projects');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [],
                'pagination',
            ]);

        $this->assertCount(5, $response->json('data'));
    }

    #[Test]
    public function it_can_create_a_project()
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/projects', [
                'name' => 'New Project',
                'description' => 'Project Description',
                'status' => 'active',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'message',
                'data' => ['id', 'name', 'status'],
            ]);

        $this->assertDatabaseHas('projects', [
            'name' => 'New Project',
            'organization_id' => $this->organization->id,
        ]);
    }

    #[Test]
    public function it_validates_project_creation_data()
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/projects', [
                'name' => '',
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['name']);
    }

    #[Test]
    public function it_can_show_a_project()
    {
        $project = Project::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson("/api/v1/projects/{$project->id}");

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => ['id', 'name'],
            ]);
    }

    #[Test]
    public function it_can_update_a_project()
    {
        $project = Project::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Original Name',
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/projects/{$project->id}", [
                'name' => 'Updated Name',
                'status' => 'active',
            ]);

        $response->assertStatus(200)
            ->assertJson(['data' => ['name' => 'Updated Name']]);

        $this->assertDatabaseHas('projects', [
            'id' => $project->id,
            'name' => 'Updated Name',
        ]);
    }

    #[Test]
    public function it_can_delete_a_project()
    {
        $project = Project::factory()->create([
            'organization_id' => $this->organization->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->deleteJson("/api/v1/projects/{$project->id}");

        $response->assertStatus(200)
            ->assertJson(['success' => true]);

        $this->assertDatabaseMissing('projects', ['id' => $project->id]);
    }

    #[Test]
    public function it_requires_authentication()
    {
        $response = $this->getJson('/api/v1/projects');

        $response->assertStatus(401);
    }

    #[Test]
    public function it_denies_project_creation_for_developer_role()
    {
        // Create a new user with developer role
        $devUser = User::factory()->create([
            'current_organization_id' => $this->organization->id,
        ]);

        $developerRole = \App\Domains\Permission\Models\Role::where('slug', 'developer')->first();

        $this->organization->users()->attach($devUser->id, [
            'role_id' => $developerRole->id,
            'joined_at' => now(),
        ]);

        $token = $devUser->createToken('dev-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
            ->postJson('/api/v1/projects', [
                'name' => 'Forbidden Project',
                'description' => 'Should not be created',
                'status' => 'active',
            ]);

        $response->assertStatus(403);
    }
}
