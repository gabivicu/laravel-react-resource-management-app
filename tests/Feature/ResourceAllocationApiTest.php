<?php

namespace Tests\Feature;

use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\Resource\Models\ResourceAllocation;
use App\Domains\User\Models\User;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class ResourceAllocationApiTest extends TestCase
{
    use RefreshDatabase;

    protected User $user;

    protected Organization $organization;

    protected Project $project;

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

        $this->project = Project::factory()->create([
            'organization_id' => $this->organization->id,
        ]);
        $this->token = $this->user->createToken('test-token')->plainTextToken;
    }

    #[Test]
    public function it_can_create_a_resource_allocation()
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/resource-allocations', [
                'project_id' => $this->project->id,
                'user_id' => $this->user->id,
                'allocation_percentage' => 50,
                'start_date' => Carbon::now()->toDateString(),
                'role' => 'Developer',
            ]);

        $response->assertStatus(201)
            ->assertJsonStructure([
                'success',
                'data' => ['id', 'allocation_percentage', 'role'],
            ]);

        $this->assertDatabaseHas('resource_allocations', [
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'allocation_percentage' => 50,
        ]);
    }

    #[Test]
    public function it_validates_allocation_percentage_maximum()
    {
        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->postJson('/api/v1/resource-allocations', [
                'project_id' => $this->project->id,
                'user_id' => $this->user->id,
                'allocation_percentage' => 150, // Exceeds 100%
                'start_date' => Carbon::now()->toDateString(),
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['allocation_percentage']);
    }

    #[Test]
    public function it_can_list_resource_allocations()
    {
        ResourceAllocation::factory()->count(3)->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->getJson('/api/v1/resource-allocations');

        $response->assertStatus(200)
            ->assertJsonStructure([
                'success',
                'data' => [],
            ]);
    }

    #[Test]
    public function it_can_update_a_resource_allocation()
    {
        $allocation = ResourceAllocation::factory()->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'allocation_percentage' => 50,
        ]);

        $response = $this->withHeader('Authorization', "Bearer {$this->token}")
            ->putJson("/api/v1/resource-allocations/{$allocation->id}", [
                'allocation_percentage' => 75,
                'role' => 'Senior Developer',
            ]);

        $response->assertStatus(200);

        $this->assertDatabaseHas('resource_allocations', [
            'id' => $allocation->id,
            'allocation_percentage' => 75,
            'role' => 'Senior Developer',
        ]);
    }
}
