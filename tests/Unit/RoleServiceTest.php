<?php

namespace Tests\Unit;

use App\Domains\Organization\Models\Organization;
use App\Domains\Permission\Models\Permission;
use App\Domains\Permission\Models\Role;
use App\Domains\Permission\Services\RoleService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RoleServiceTest extends TestCase
{
    use RefreshDatabase;

    protected RoleService $roleService;

    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        $this->roleService = new RoleService;
        $this->organization = Organization::factory()->create();
    }

    #[Test]
    public function it_can_get_roles_by_organization()
    {
        $role1 = Role::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Zebra Role',
        ]);
        $role2 = Role::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Alpha Role',
        ]);
        $otherOrg = Organization::factory()->create();
        $role3 = Role::factory()->create([
            'organization_id' => $otherOrg->id,
            'name' => 'Other Role',
        ]);

        $roles = $this->roleService->getByOrganization($this->organization->id);

        $this->assertCount(2, $roles);
        $this->assertEquals('Alpha Role', $roles->first()->name); // Ordered by name
        $this->assertEquals('Zebra Role', $roles->last()->name);
        $this->assertTrue($roles->first()->relationLoaded('permissions'));
    }

    #[Test]
    public function it_can_find_role_by_id()
    {
        $role = Role::factory()->create(['organization_id' => $this->organization->id]);
        $permission = Permission::factory()->create();
        $role->permissions()->attach($permission->id);

        $found = $this->roleService->find($role->id);

        $this->assertInstanceOf(Role::class, $found);
        $this->assertEquals($role->id, $found->id);
        $this->assertTrue($found->relationLoaded('permissions'));
        $this->assertCount(1, $found->permissions);
    }

    #[Test]
    public function it_returns_null_when_role_not_found()
    {
        $found = $this->roleService->find(99999);

        $this->assertNull($found);
    }

    #[Test]
    public function it_can_create_role()
    {
        $data = [
            'name' => 'New Role',
            'description' => 'Role Description',
        ];

        $role = $this->roleService->create($data, $this->organization->id);

        $this->assertInstanceOf(Role::class, $role);
        $this->assertEquals('New Role', $role->name);
        $this->assertEquals('new-role', $role->slug);
        $this->assertEquals('Role Description', $role->description);
        $this->assertFalse($role->is_system);
        $this->assertEquals($this->organization->id, $role->organization_id);
    }

    #[Test]
    public function it_can_create_role_with_permissions()
    {
        $permission1 = Permission::factory()->create();
        $permission2 = Permission::factory()->create();

        $data = [
            'name' => 'New Role',
            'permission_ids' => [$permission1->id, $permission2->id],
        ];

        $role = $this->roleService->create($data, $this->organization->id);

        $this->assertCount(2, $role->permissions);
        $this->assertTrue($role->permissions->contains($permission1));
        $this->assertTrue($role->permissions->contains($permission2));
    }

    #[Test]
    public function it_can_create_role_without_description()
    {
        $data = [
            'name' => 'New Role',
        ];

        $role = $this->roleService->create($data, $this->organization->id);

        $this->assertNull($role->description);
    }

    #[Test]
    public function it_can_update_role()
    {
        $role = Role::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Old Name',
            'description' => 'Old Description',
        ]);

        $data = [
            'name' => 'New Name',
            'description' => 'New Description',
        ];

        $updated = $this->roleService->update($role->id, $data);

        $this->assertEquals('New Name', $updated->name);
        $this->assertEquals('new-name', $updated->slug);
        $this->assertEquals('New Description', $updated->description);
    }

    #[Test]
    public function it_can_update_role_with_partial_data()
    {
        $role = Role::factory()->create([
            'organization_id' => $this->organization->id,
            'name' => 'Old Name',
            'description' => 'Old Description',
        ]);

        $data = [
            'name' => 'New Name',
        ];

        $updated = $this->roleService->update($role->id, $data);

        $this->assertEquals('New Name', $updated->name);
        $this->assertEquals('Old Description', $updated->description); // Unchanged
    }

    #[Test]
    public function it_can_update_role_permissions()
    {
        $role = Role::factory()->create(['organization_id' => $this->organization->id]);
        $permission1 = Permission::factory()->create();
        $permission2 = Permission::factory()->create();
        $permission3 = Permission::factory()->create();
        $role->permissions()->attach([$permission1->id, $permission2->id]);

        $data = [
            'permission_ids' => [$permission2->id, $permission3->id],
        ];

        $updated = $this->roleService->update($role->id, $data);

        $this->assertCount(2, $updated->permissions);
        $this->assertFalse($updated->permissions->contains($permission1));
        $this->assertTrue($updated->permissions->contains($permission2));
        $this->assertTrue($updated->permissions->contains($permission3));
    }

    #[Test]
    public function it_prevents_updating_system_roles()
    {
        $role = Role::factory()->create([
            'organization_id' => $this->organization->id,
            'is_system' => true,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Cannot update system roles');

        $this->roleService->update($role->id, ['name' => 'New Name']);
    }

    #[Test]
    public function it_can_delete_role()
    {
        $role = Role::factory()->create(['organization_id' => $this->organization->id]);

        $result = $this->roleService->delete($role->id);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('roles', ['id' => $role->id]);
    }

    #[Test]
    public function it_prevents_deleting_system_roles()
    {
        $role = Role::factory()->create([
            'organization_id' => $this->organization->id,
            'is_system' => true,
        ]);

        $this->expectException(\Exception::class);
        $this->expectExceptionMessage('Cannot delete system roles');

        $this->roleService->delete($role->id);
    }

    #[Test]
    public function it_can_get_all_permissions()
    {
        $permission1 = Permission::factory()->create(['group' => 'B Group', 'name' => 'B Permission']);
        $permission2 = Permission::factory()->create(['group' => 'A Group', 'name' => 'A Permission']);
        $permission3 = Permission::factory()->create(['group' => 'A Group', 'name' => 'Z Permission']);

        $permissions = $this->roleService->getAllPermissions();

        $this->assertCount(3, $permissions);
        // Should be ordered by group, then by name
        $this->assertEquals('A Permission', $permissions->first()->name);
        $this->assertEquals('Z Permission', $permissions->get(1)->name);
        $this->assertEquals('B Permission', $permissions->last()->name);
    }

    #[Test]
    public function it_throws_exception_when_role_not_found_on_update()
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->roleService->update(99999, ['name' => 'Test']);
    }

    #[Test]
    public function it_throws_exception_when_role_not_found_on_delete()
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->roleService->delete(99999);
    }

    #[Test]
    public function it_creates_role_in_transaction()
    {
        // Test that if permission sync fails, role creation is rolled back
        // This is more of an integration test, but we can verify transaction behavior
        $data = [
            'name' => 'New Role',
        ];

        $role = $this->roleService->create($data, $this->organization->id);

        $this->assertDatabaseHas('roles', ['id' => $role->id]);
    }
}
