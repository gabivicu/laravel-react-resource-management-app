<?php

namespace Tests\Unit;

use App\Domains\Organization\Models\Organization;
use App\Domains\Project\Models\Project;
use App\Domains\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Auth;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class HasTenantScopeTest extends TestCase
{
    use RefreshDatabase;

    protected Organization $organization1;

    protected Organization $organization2;

    protected User $user1;

    protected User $user2;

    protected User $superAdmin;

    protected function setUp(): void
    {
        parent::setUp();
        $this->organization1 = Organization::factory()->create();
        $this->organization2 = Organization::factory()->create();
        $this->user1 = User::factory()->create();
        $this->user2 = User::factory()->create();
        $this->superAdmin = User::factory()->create(['is_super_admin' => true]);

        $this->user1->organizations()->attach($this->organization1->id);
        $this->user2->organizations()->attach($this->organization2->id);
    }

    #[Test]
    public function it_applies_tenant_scope_to_queries()
    {
        Auth::login($this->user1);

        $project1 = Project::factory()->create(['organization_id' => $this->organization1->id]);
        $project2 = Project::factory()->create(['organization_id' => $this->organization2->id]);

        // Set tenant in request
        request()->merge(['organization_id' => $this->organization1->id]);
        request()->headers->set('X-Tenant-ID', (string) $this->organization1->id);

        $projects = Project::all();

        $this->assertCount(1, $projects);
        $this->assertEquals($project1->id, $projects->first()->id);
        $this->assertEquals($this->organization1->id, $projects->first()->organization_id);
    }

    #[Test]
    public function it_auto_sets_organization_id_on_creation()
    {
        Auth::login($this->user1);

        // Set tenant in request
        request()->merge(['organization_id' => $this->organization1->id]);
        request()->headers->set('X-Tenant-ID', (string) $this->organization1->id);

        $project = Project::create([
            'name' => 'Test Project',
            'description' => 'Test Description',
            'status' => 'planning',
        ]);

        $this->assertEquals($this->organization1->id, $project->organization_id);
    }

    #[Test]
    public function it_does_not_override_explicit_organization_id_on_creation()
    {
        Auth::login($this->user1);

        // Set tenant in request
        request()->merge(['organization_id' => $this->organization1->id]);
        request()->headers->set('X-Tenant-ID', (string) $this->organization1->id);

        $project = Project::create([
            'organization_id' => $this->organization2->id,
            'name' => 'Test Project',
            'description' => 'Test Description',
            'status' => 'planning',
        ]);

        $this->assertEquals($this->organization2->id, $project->organization_id);
    }

    #[Test]
    public function it_skips_tenant_scope_for_super_admin()
    {
        Auth::login($this->superAdmin);

        $project1 = Project::factory()->create(['organization_id' => $this->organization1->id]);
        $project2 = Project::factory()->create(['organization_id' => $this->organization2->id]);

        $projects = Project::all();

        $this->assertCount(2, $projects);
    }

    #[Test]
    public function it_uses_tenant_from_authenticated_user_current_organization()
    {
        $this->user1->update(['current_organization_id' => $this->organization1->id]);
        Auth::login($this->user1);

        $project1 = Project::factory()->create(['organization_id' => $this->organization1->id]);
        $project2 = Project::factory()->create(['organization_id' => $this->organization2->id]);

        $projects = Project::all();

        $this->assertCount(1, $projects);
        $this->assertEquals($project1->id, $projects->first()->id);
    }

    #[Test]
    public function it_uses_tenant_from_authenticated_user_first_organization()
    {
        Auth::login($this->user1);

        $project1 = Project::factory()->create(['organization_id' => $this->organization1->id]);
        $project2 = Project::factory()->create(['organization_id' => $this->organization2->id]);

        $projects = Project::all();

        $this->assertCount(1, $projects);
        $this->assertEquals($project1->id, $projects->first()->id);
    }

    #[Test]
    public function it_allows_querying_without_tenant_scope()
    {
        Auth::login($this->user1);

        $project1 = Project::factory()->create(['organization_id' => $this->organization1->id]);
        $project2 = Project::factory()->create(['organization_id' => $this->organization2->id]);

        // Set tenant in request
        request()->merge(['organization_id' => $this->organization1->id]);
        request()->headers->set('X-Tenant-ID', (string) $this->organization1->id);

        $projects = Project::withoutTenantScope()->get();

        $this->assertCount(2, $projects);
    }

    #[Test]
    public function it_allows_querying_for_specific_tenant()
    {
        Auth::login($this->user1);

        $project1 = Project::factory()->create(['organization_id' => $this->organization1->id]);
        $project2 = Project::factory()->create(['organization_id' => $this->organization2->id]);

        // Set tenant in request (should be ignored by forTenant)
        request()->merge(['organization_id' => $this->organization1->id]);
        request()->headers->set('X-Tenant-ID', (string) $this->organization1->id);

        $projects = Project::forTenant($this->organization2->id)->get();

        $this->assertCount(1, $projects);
        $this->assertEquals($project2->id, $projects->first()->id);
    }

    #[Test]
    public function it_prioritizes_request_header_over_user_organization()
    {
        $this->user1->update(['current_organization_id' => $this->organization1->id]);
        Auth::login($this->user1);

        $project1 = Project::factory()->create(['organization_id' => $this->organization1->id]);
        $project2 = Project::factory()->create(['organization_id' => $this->organization2->id]);

        // Set different tenant in request header
        request()->headers->set('X-Tenant-ID', (string) $this->organization2->id);

        $projects = Project::all();

        // Should use header, but user doesn't belong to org2, so scope won't apply
        // Actually, the scope checks if tenantId exists, so it will try to filter
        // But since user doesn't belong, getCurrentTenantId might return null
        // Let's test with user that belongs to both orgs
        $this->user1->organizations()->attach($this->organization2->id);
        request()->headers->set('X-Tenant-ID', (string) $this->organization2->id);

        $projects = Project::all();

        $this->assertCount(1, $projects);
        $this->assertEquals($project2->id, $projects->first()->id);
    }

    #[Test]
    public function it_uses_session_tenant_when_header_not_present()
    {
        Auth::login($this->user1);
        $this->user1->organizations()->attach($this->organization2->id);

        $project1 = Project::factory()->create(['organization_id' => $this->organization1->id]);
        $project2 = Project::factory()->create(['organization_id' => $this->organization2->id]);

        session(['tenant_id' => $this->organization2->id]);

        $projects = Project::all();

        $this->assertCount(1, $projects);
        $this->assertEquals($project2->id, $projects->first()->id);
    }

    #[Test]
    public function it_does_not_apply_scope_when_no_tenant_available()
    {
        $otherUser = User::factory()->create();
        Auth::login($otherUser);

        $project1 = Project::factory()->create(['organization_id' => $this->organization1->id]);
        $project2 = Project::factory()->create(['organization_id' => $this->organization2->id]);

        $projects = Project::all();

        // When no tenant is available, scope should not filter
        $this->assertCount(2, $projects);
    }
}
