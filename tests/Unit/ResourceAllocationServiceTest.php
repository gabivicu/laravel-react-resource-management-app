<?php

namespace Tests\Unit;

use App\Domains\Resource\Services\ResourceAllocationService;
use App\Domains\Resource\Repositories\ResourceAllocationRepository;
use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\User\Models\User;
use App\Domains\Resource\Models\ResourceAllocation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Validation\ValidationException;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;
use Carbon\Carbon;

class ResourceAllocationServiceTest extends TestCase
{
    use RefreshDatabase;

    protected ResourceAllocationService $allocationService;
    protected Organization $organization;
    protected Project $project;
    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->allocationService = new ResourceAllocationService(new ResourceAllocationRepository());
        $this->organization = Organization::factory()->create();
        $this->project = Project::factory()->create([
            'organization_id' => $this->organization->id,
        ]);
        $this->user = User::factory()->create();
    }

    #[Test]
    public function it_can_create_a_resource_allocation()
    {
        $data = [
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'allocation_percentage' => 50,
            'start_date' => Carbon::now()->toDateString(),
            'role' => 'Developer',
        ];

        $allocation = $this->allocationService->create($data, $this->organization->id);

        $this->assertInstanceOf(ResourceAllocation::class, $allocation);
        $this->assertEquals(50, $allocation->allocation_percentage);
        $this->assertEquals('Developer', $allocation->role);
    }

    #[Test]
    public function it_validates_allocation_percentage_does_not_exceed_100_percent()
    {
        // Create existing allocation
        ResourceAllocation::factory()->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'allocation_percentage' => 60,
            'start_date' => Carbon::now()->toDateString(),
        ]);

        $data = [
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'allocation_percentage' => 50, // Would make total 110%
            'start_date' => Carbon::now()->toDateString(),
        ];

        $this->expectException(ValidationException::class);

        $this->allocationService->create($data, $this->organization->id);
    }

    #[Test]
    public function it_allows_100_percent_allocation_for_single_project()
    {
        $data = [
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'allocation_percentage' => 100,
            'start_date' => Carbon::now()->toDateString(),
        ];

        $allocation = $this->allocationService->create($data, $this->organization->id);

        $this->assertEquals(100, $allocation->allocation_percentage);
    }

    #[Test]
    public function it_can_update_an_allocation()
    {
        $allocation = ResourceAllocation::factory()->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'allocation_percentage' => 50,
        ]);

        $data = [
            'allocation_percentage' => 75,
            'role' => 'Senior Developer',
        ];

        $updated = $this->allocationService->update($allocation->id, $data);

        $this->assertEquals(75, $updated->allocation_percentage);
        $this->assertEquals('Senior Developer', $updated->role);
    }

    #[Test]
    public function it_can_get_active_allocations()
    {
        ResourceAllocation::factory()->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'start_date' => Carbon::now()->subDays(10),
            'end_date' => null, // Active
        ]);

        ResourceAllocation::factory()->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
            'start_date' => Carbon::now()->subDays(20),
            'end_date' => Carbon::now()->subDays(5), // Inactive
        ]);

        $active = $this->allocationService->getActive();

        $this->assertCount(1, $active);
    }

    #[Test]
    public function it_can_delete_an_allocation()
    {
        $allocation = ResourceAllocation::factory()->create([
            'organization_id' => $this->organization->id,
            'project_id' => $this->project->id,
            'user_id' => $this->user->id,
        ]);

        $result = $this->allocationService->delete($allocation->id);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('resource_allocations', ['id' => $allocation->id]);
    }
}
