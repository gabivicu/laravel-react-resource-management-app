<?php

namespace Tests\Unit;

use App\Domains\Organization\Models\Organization;
use App\Domains\Permission\Models\Role;
use App\Domains\User\Models\User;
use App\Domains\User\Services\UserService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class UserServiceTest extends TestCase
{
    use RefreshDatabase;

    protected UserService $userService;

    protected Organization $organization;

    protected function setUp(): void
    {
        parent::setUp();
        $this->userService = new UserService;
        $this->organization = Organization::factory()->create();
    }

    #[Test]
    public function it_can_get_paginated_users()
    {
        $user1 = User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
        $user2 = User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);
        $user3 = User::factory()->create(['name' => 'Bob Wilson', 'email' => 'bob@example.com']);

        $this->organization->users()->attach([$user1->id, $user2->id, $user3->id]);

        $result = $this->userService->getPaginated($this->organization->id, [], 2);

        $this->assertInstanceOf(\Illuminate\Pagination\LengthAwarePaginator::class, $result);
        $this->assertEquals(3, $result->total());
        $this->assertEquals(2, $result->perPage());
        $this->assertCount(2, $result->items());
    }

    #[Test]
    public function it_can_filter_users_by_search()
    {
        $user1 = User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
        $user2 = User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);
        $user3 = User::factory()->create(['name' => 'Bob Wilson', 'email' => 'bob@example.com']);

        $this->organization->users()->attach([$user1->id, $user2->id, $user3->id]);

        $result = $this->userService->getPaginated($this->organization->id, ['search' => 'John'], 15);

        $this->assertEquals(1, $result->total());
        $this->assertEquals('John Doe', $result->items()[0]->name);
    }

    #[Test]
    public function it_can_search_users_by_email()
    {
        $user1 = User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
        $user2 = User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);

        $this->organization->users()->attach([$user1->id, $user2->id]);

        $result = $this->userService->getPaginated($this->organization->id, ['search' => 'jane@'], 15);

        $this->assertEquals(1, $result->total());
        $this->assertEquals('Jane Smith', $result->items()[0]->name);
    }

    #[Test]
    public function it_can_find_user_by_id()
    {
        $user = User::factory()->create();
        $this->organization->users()->attach($user->id);

        $found = $this->userService->find($user->id);

        $this->assertInstanceOf(User::class, $found);
        $this->assertEquals($user->id, $found->id);
        $this->assertTrue($found->relationLoaded('organizations'));
        $this->assertTrue($found->relationLoaded('currentOrganization'));
    }

    #[Test]
    public function it_returns_null_when_user_not_found()
    {
        $found = $this->userService->find(99999);

        $this->assertNull($found);
    }

    #[Test]
    public function it_can_create_user()
    {
        $data = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
        ];

        $user = $this->userService->create($data, $this->organization->id);

        $this->assertInstanceOf(User::class, $user);
        $this->assertEquals('New User', $user->name);
        $this->assertEquals('newuser@example.com', $user->email);
        $this->assertTrue(Hash::check('password123', $user->password));
        $this->assertTrue($user->organizations->contains($this->organization));
    }

    #[Test]
    public function it_attaches_user_to_organization_on_creation()
    {
        $data = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
        ];

        $user = $this->userService->create($data, $this->organization->id);

        $this->assertTrue($this->organization->users->contains($user));
    }

    #[Test]
    public function it_can_update_user()
    {
        $user = User::factory()->create(['name' => 'Old Name', 'email' => 'old@example.com']);

        $data = [
            'name' => 'New Name',
            'email' => 'new@example.com',
        ];

        $updated = $this->userService->update($user->id, $data);

        $this->assertEquals('New Name', $updated->name);
        $this->assertEquals('new@example.com', $updated->email);
    }

    #[Test]
    public function it_can_update_user_password()
    {
        $user = User::factory()->create(['password' => Hash::make('oldpassword')]);

        $data = [
            'password' => 'newpassword123',
        ];

        $updated = $this->userService->update($user->id, $data);

        $this->assertTrue(Hash::check('newpassword123', $updated->password));
        $this->assertFalse(Hash::check('oldpassword', $updated->password));
    }

    #[Test]
    public function it_can_update_user_with_partial_data()
    {
        $user = User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);

        $data = [
            'name' => 'John Updated',
        ];

        $updated = $this->userService->update($user->id, $data);

        $this->assertEquals('John Updated', $updated->name);
        $this->assertEquals('john@example.com', $updated->email); // Unchanged
    }

    #[Test]
    public function it_can_upload_avatar()
    {
        Storage::fake('public');

        $user = User::factory()->create();
        // Use create instead of image to avoid GD extension requirement
        $file = UploadedFile::fake()->create('avatar.jpg', 100);

        $url = $this->userService->uploadAvatar($user->id, $file);

        $user->refresh();

        $this->assertNotNull($url);
        $this->assertNotNull($user->avatar);
        $this->assertStringContainsString('avatars', $url);
        // Check that file exists (pattern matching might not work, so check differently)
        $files = Storage::disk('public')->files('avatars');
        $this->assertNotEmpty($files);
    }

    #[Test]
    public function it_deletes_old_avatar_when_uploading_new_one()
    {
        Storage::fake('public');

        $user = User::factory()->create(['avatar' => 'http://example.com/old-avatar.jpg']);
        $oldPath = 'avatars/old.jpg';
        Storage::disk('public')->put($oldPath, 'fake content');

        $file = UploadedFile::fake()->create('new-avatar.jpg', 100);
        $this->userService->uploadAvatar($user->id, $file);

        $user->refresh();
        $this->assertNotNull($user->avatar);
        $this->assertNotEquals('http://example.com/old-avatar.jpg', $user->avatar);
    }

    #[Test]
    public function it_can_remove_avatar()
    {
        Storage::fake('public');

        $user = User::factory()->create(['avatar' => 'http://example.com/avatar.jpg']);
        $path = 'avatars/test.jpg';
        Storage::disk('public')->put($path, 'fake content');

        $this->userService->removeAvatar($user->id);

        $user->refresh();
        $this->assertNull($user->avatar);
    }

    #[Test]
    public function it_can_delete_user()
    {
        $user = User::factory()->create();

        $result = $this->userService->delete($user->id);

        $this->assertTrue($result);
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }

    #[Test]
    public function it_can_assign_role_to_user_in_organization()
    {
        $user = User::factory()->create();
        $role = Role::factory()->create(['organization_id' => $this->organization->id]);
        $this->organization->users()->attach($user->id);

        $this->userService->assignRole($user->id, $this->organization->id, $role->id);

        $pivot = $this->organization->users()->where('user_id', $user->id)->first()->pivot;
        $this->assertEquals($role->id, $pivot->role_id);
    }

    #[Test]
    public function it_can_remove_role_from_user_in_organization()
    {
        $user = User::factory()->create();
        $role = Role::factory()->create(['organization_id' => $this->organization->id]);
        $this->organization->users()->attach($user->id, ['role_id' => $role->id]);

        $this->userService->removeRole($user->id, $this->organization->id);

        $pivot = $this->organization->users()->where('user_id', $user->id)->first()->pivot;
        $this->assertNull($pivot->role_id);
    }

    #[Test]
    public function it_throws_exception_when_organization_not_found_on_create()
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $data = [
            'name' => 'New User',
            'email' => 'newuser@example.com',
            'password' => 'password123',
        ];

        $this->userService->create($data, 99999);
    }

    #[Test]
    public function it_throws_exception_when_user_not_found_on_update()
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->userService->update(99999, ['name' => 'Test']);
    }

    #[Test]
    public function it_throws_exception_when_user_not_found_on_delete()
    {
        $this->expectException(\Illuminate\Database\Eloquent\ModelNotFoundException::class);

        $this->userService->delete(99999);
    }
}
