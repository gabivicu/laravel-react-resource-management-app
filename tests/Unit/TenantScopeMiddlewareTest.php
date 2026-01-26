<?php

namespace Tests\Unit;

use App\Core\Middleware\TenantScopeMiddleware;
use App\Domains\Organization\Models\Organization;
use App\Domains\User\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TenantScopeMiddlewareTest extends TestCase
{
    use RefreshDatabase;

    protected TenantScopeMiddleware $middleware;

    protected Organization $organization;

    protected User $user;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new TenantScopeMiddleware;
        $this->organization = Organization::factory()->create();
        $this->user = User::factory()->create();
        $this->user->organizations()->attach($this->organization->id);
    }

    #[Test]
    public function it_resolves_tenant_id_from_header()
    {
        Auth::login($this->user);

        $request = Request::create('/test', 'GET');
        $request->headers->set('X-Tenant-ID', (string) $this->organization->id);

        $tenantId = $this->invokeMethod($this->middleware, 'resolveTenantId', [$request]);

        $this->assertEquals($this->organization->id, $tenantId);
    }

    #[Test]
    public function it_resolves_tenant_id_from_query_parameter()
    {
        Auth::login($this->user);

        $request = Request::create('/test?organization_id='.$this->organization->id, 'GET');

        $tenantId = $this->invokeMethod($this->middleware, 'resolveTenantId', [$request]);

        $this->assertEquals($this->organization->id, $tenantId);
    }

    #[Test]
    public function it_resolves_tenant_id_from_request_body()
    {
        Auth::login($this->user);

        $request = Request::create('/test', 'POST', ['organization_id' => $this->organization->id]);

        $tenantId = $this->invokeMethod($this->middleware, 'resolveTenantId', [$request]);

        $this->assertEquals($this->organization->id, $tenantId);
    }

    #[Test]
    public function it_resolves_tenant_id_from_session()
    {
        Auth::login($this->user);

        $this->withSession(['tenant_id' => $this->organization->id]);

        $request = Request::create('/test', 'GET');
        $request->setLaravelSession($this->app['session.store']);

        $tenantId = $this->invokeMethod($this->middleware, 'resolveTenantId', [$request]);

        $this->assertEquals($this->organization->id, $tenantId);
    }

    #[Test]
    public function it_resolves_tenant_id_from_authenticated_user_current_organization()
    {
        $this->user->update(['current_organization_id' => $this->organization->id]);
        Auth::login($this->user);

        $request = Request::create('/test', 'GET');

        $tenantId = $this->invokeMethod($this->middleware, 'resolveTenantId', [$request]);

        $this->assertEquals($this->organization->id, $tenantId);
    }

    #[Test]
    public function it_resolves_tenant_id_from_authenticated_user_first_organization()
    {
        Auth::login($this->user);

        $request = Request::create('/test', 'GET');

        $tenantId = $this->invokeMethod($this->middleware, 'resolveTenantId', [$request]);

        $this->assertEquals($this->organization->id, $tenantId);
    }

    #[Test]
    public function it_returns_null_when_user_not_authenticated()
    {
        $request = Request::create('/test', 'GET');
        $request->headers->set('X-Tenant-ID', (string) $this->organization->id);

        $tenantId = $this->invokeMethod($this->middleware, 'resolveTenantId', [$request]);

        $this->assertNull($tenantId);
    }

    #[Test]
    public function it_returns_null_when_user_does_not_belong_to_organization()
    {
        $otherOrganization = Organization::factory()->create();
        Auth::login($this->user);

        $request = Request::create('/test', 'GET');
        $request->headers->set('X-Tenant-ID', (string) $otherOrganization->id);

        $tenantId = $this->invokeMethod($this->middleware, 'resolveTenantId', [$request]);

        $this->assertNull($tenantId);
    }

    #[Test]
    public function it_allows_super_admin_to_access_any_tenant()
    {
        $superAdmin = User::factory()->create(['is_super_admin' => true]);
        $otherOrganization = Organization::factory()->create();
        Auth::login($superAdmin);

        $request = Request::create('/test', 'GET');
        $request->headers->set('X-Tenant-ID', (string) $otherOrganization->id);

        $tenantId = $this->invokeMethod($this->middleware, 'resolveTenantId', [$request]);

        $this->assertEquals($otherOrganization->id, $tenantId);
    }

    #[Test]
    public function it_sets_tenant_in_request_when_handling_request()
    {
        Auth::login($this->user);

        $request = Request::create('/test', 'GET');
        $request->headers->set('X-Tenant-ID', (string) $this->organization->id);
        $request->setLaravelSession($this->app['session.store']);

        $response = $this->middleware->handle($request, function ($req) {
            return response('OK');
        });

        $this->assertEquals('OK', $response->getContent());
        $this->assertEquals($this->organization->id, $request->input('organization_id'));
        $this->assertEquals($this->organization->id, $request->header('X-Tenant-ID'));
        $this->assertEquals($this->organization->id, $this->app['session.store']->get('tenant_id'));
    }

    #[Test]
    public function it_does_not_set_tenant_when_no_tenant_resolved()
    {
        $otherUser = User::factory()->create();
        Auth::login($otherUser);

        $request = Request::create('/test', 'GET');
        $request->setLaravelSession($this->app['session.store']);

        $response = $this->middleware->handle($request, function ($req) {
            return response('OK');
        });

        $this->assertEquals('OK', $response->getContent());
        $this->assertNull($request->input('organization_id'));
    }

    #[Test]
    public function it_prioritizes_header_over_other_sources()
    {
        $otherOrganization = Organization::factory()->create();
        $this->user->organizations()->attach($otherOrganization->id);
        $this->user->update(['current_organization_id' => $otherOrganization->id]);
        Auth::login($this->user);

        $request = Request::create('/test', 'GET');
        $request->headers->set('X-Tenant-ID', (string) $this->organization->id);
        $this->withSession(['tenant_id' => $otherOrganization->id]);
        $request->setLaravelSession($this->app['session.store']);

        $tenantId = $this->invokeMethod($this->middleware, 'resolveTenantId', [$request]);

        $this->assertEquals($this->organization->id, $tenantId);
    }

    /**
     * Helper method to invoke protected/private methods for testing
     */
    protected function invokeMethod(object $object, string $methodName, array $parameters = [])
    {
        $reflection = new \ReflectionClass(get_class($object));
        $method = $reflection->getMethod($methodName);
        $method->setAccessible(true);

        return $method->invokeArgs($object, $parameters);
    }
}
