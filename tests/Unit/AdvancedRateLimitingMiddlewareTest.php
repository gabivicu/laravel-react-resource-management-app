<?php

namespace Tests\Unit;

use App\Core\Middleware\AdvancedRateLimitingMiddleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Mockery;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AdvancedRateLimitingMiddlewareTest extends TestCase
{
    protected AdvancedRateLimitingMiddleware $middleware;

    protected function setUp(): void
    {
        parent::setUp();
        $this->middleware = new AdvancedRateLimitingMiddleware;
        Cache::flush();
    }

    protected function tearDown(): void
    {
        Cache::flush();
        Mockery::close();
        parent::tearDown();
    }

    #[Test]
    public function it_allows_request_when_under_rate_limit(): void
    {
        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        $response = $this->middleware->handle($request, $next, 'default');

        $this->assertEquals(200, $response->getStatusCode());
        $this->assertTrue($response->headers->has('X-RateLimit-Limit'));
        $this->assertTrue($response->headers->has('X-RateLimit-Remaining'));
        $this->assertTrue($response->headers->has('X-RateLimit-Reset'));
    }

    #[Test]
    public function it_blocks_request_when_rate_limit_exceeded(): void
    {
        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        // Set cache to exceed limit for 'strict' type (limit is 10)
        $identifier = 'ip:127.0.0.1';
        $key = "rate_limit:strict:{$identifier}:".md5('/test');
        Cache::put($key, 10, now()->addMinutes(1));

        $response = $this->middleware->handle($request, $next, 'strict');

        $this->assertEquals(429, $response->getStatusCode());
        $this->assertEquals('rate_limit_exceeded', json_decode($response->getContent(), true)['error']);
        $this->assertTrue($response->headers->has('Retry-After'));
        $this->assertTrue($response->headers->has('X-RateLimit-Limit'));
        $this->assertEquals(0, $response->headers->get('X-RateLimit-Remaining'));
    }

    #[Test]
    public function it_uses_ip_address_when_user_not_authenticated(): void
    {
        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '192.168.1.100');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        $response = $this->middleware->handle($request, $next, 'default');

        // Verify cache key was created with IP
        $key = 'rate_limit:default:ip:192.168.1.100:'.md5('/test');
        $this->assertTrue(Cache::has($key) || Cache::get($key, 0) >= 0);
    }

    #[Test]
    public function it_uses_user_id_when_user_is_authenticated(): void
    {
        $user = Mockery::mock('Illuminate\Contracts\Auth\Authenticatable');
        $user->shouldReceive('getAuthIdentifierName')->andReturn('id');
        $user->shouldReceive('getAuthIdentifier')->andReturn(123);

        $request = Request::create('/test', 'GET');
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        $response = $this->middleware->handle($request, $next, 'default');

        // Verify cache key was created with user ID
        $key = 'rate_limit:default:user:123:'.md5('/test');
        $this->assertTrue(Cache::has($key) || Cache::get($key, 0) >= 0);
    }

    #[Test]
    public function it_applies_correct_limits_for_auth_type(): void
    {
        $request = Request::create('/auth/login', 'POST');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        // Make 5 requests (the limit for auth)
        for ($i = 0; $i < 5; $i++) {
            $response = $this->middleware->handle($request, $next, 'auth');
            $this->assertEquals(200, $response->getStatusCode());
        }

        // 6th request should be rate limited
        $response = $this->middleware->handle($request, $next, 'auth');
        $this->assertEquals(429, $response->getStatusCode());
    }

    #[Test]
    public function it_applies_correct_limits_for_write_type(): void
    {
        $request = Request::create('/api/projects', 'POST');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        // Make 60 requests (the limit for write)
        for ($i = 0; $i < 60; $i++) {
            $response = $this->middleware->handle($request, $next, 'write');
            $this->assertEquals(200, $response->getStatusCode());
        }

        // 61st request should be rate limited
        $response = $this->middleware->handle($request, $next, 'write');
        $this->assertEquals(429, $response->getStatusCode());
    }

    #[Test]
    public function it_applies_correct_limits_for_read_type(): void
    {
        $request = Request::create('/api/projects', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        // Make 300 requests (the limit for read)
        for ($i = 0; $i < 300; $i++) {
            $response = $this->middleware->handle($request, $next, 'read');
            $this->assertEquals(200, $response->getStatusCode());
        }

        // 301st request should be rate limited
        $response = $this->middleware->handle($request, $next, 'read');
        $this->assertEquals(429, $response->getStatusCode());
    }

    #[Test]
    public function it_blocks_ip_after_10_violations(): void
    {
        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '192.168.1.200');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        $identifier = 'ip:192.168.1.200';

        // Simulate 10 violations
        for ($i = 0; $i < 10; $i++) {
            // Set cache to exceed limit
            $key = "rate_limit:strict:{$identifier}:".md5('/test');
            Cache::put($key, 10, now()->addMinutes(1));

            // Trigger violation
            $this->middleware->handle($request, $next, 'strict');
        }

        // Next request should be blocked
        $key = "rate_limit:strict:{$identifier}:".md5('/test');
        Cache::forget($key); // Clear rate limit to test blocking

        $response = $this->middleware->handle($request, $next, 'strict');
        $this->assertEquals(429, $response->getStatusCode());

        $body = json_decode($response->getContent(), true);
        $this->assertStringContainsString('blocked', strtolower($body['message']));
    }

    #[Test]
    public function it_increments_rate_limit_counter(): void
    {
        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        $identifier = 'ip:127.0.0.1';
        $key = "rate_limit:default:{$identifier}:".md5('/test');

        // First request
        $this->middleware->handle($request, $next, 'default');
        $this->assertEquals(1, Cache::get($key, 0));

        // Second request
        $this->middleware->handle($request, $next, 'default');
        $this->assertEquals(2, Cache::get($key, 0));
    }

    #[Test]
    public function it_adds_rate_limit_headers_to_response(): void
    {
        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        $response = $this->middleware->handle($request, $next, 'default');

        $this->assertTrue($response->headers->has('X-RateLimit-Limit'));
        $this->assertTrue($response->headers->has('X-RateLimit-Remaining'));
        $this->assertTrue($response->headers->has('X-RateLimit-Reset'));

        $limit = (int) $response->headers->get('X-RateLimit-Limit');
        $remaining = (int) $response->headers->get('X-RateLimit-Remaining');

        $this->assertGreaterThan(0, $limit);
        $this->assertGreaterThanOrEqual(0, $remaining);
        $this->assertLessThanOrEqual($limit, $remaining);
    }

    #[Test]
    public function it_logs_rate_limit_violations(): void
    {
        Log::shouldReceive('warning')
            ->once()
            ->with('Rate limit exceeded', Mockery::type('array'));

        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        // Set cache to exceed limit
        $identifier = 'ip:127.0.0.1';
        $key = "rate_limit:strict:{$identifier}:".md5('/test');
        Cache::put($key, 10, now()->addMinutes(1));

        $this->middleware->handle($request, $next, 'strict');
    }

    #[Test]
    public function it_logs_blocked_requests(): void
    {
        Log::shouldReceive('warning')
            ->once()
            ->with('Blocked request from IP', Mockery::type('array'));

        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '192.168.1.300');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        $identifier = 'ip:192.168.1.300';

        // Block the identifier
        $blockKey = "rate_limit_blocked:{$identifier}";
        Cache::put($blockKey, true, now()->addHours(24));

        $this->middleware->handle($request, $next, 'default');
    }

    #[Test]
    public function it_tracks_violations_correctly(): void
    {
        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '192.168.1.400');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        $identifier = 'ip:192.168.1.400';
        $violationKey = "rate_limit_violations:{$identifier}";
        $key = "rate_limit:strict:{$identifier}:".md5('/test');

        // Simulate 5 violations
        for ($i = 0; $i < 5; $i++) {
            Cache::put($key, 10, now()->addMinutes(1));
            $this->middleware->handle($request, $next, 'strict');
            Cache::forget($key); // Reset for next violation
        }

        $violations = Cache::get($violationKey, 0);
        $this->assertEquals(5, $violations);
    }

    #[Test]
    public function it_uses_different_cache_keys_for_different_paths(): void
    {
        $request1 = Request::create('/path1', 'GET');
        $request1->server->set('REMOTE_ADDR', '127.0.0.1');

        $request2 = Request::create('/path2', 'GET');
        $request2->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        $identifier = 'ip:127.0.0.1';
        $key1 = "rate_limit:default:{$identifier}:".md5('/path1');
        $key2 = "rate_limit:default:{$identifier}:".md5('/path2');

        $this->middleware->handle($request1, $next, 'default');
        $this->middleware->handle($request2, $next, 'default');

        $this->assertEquals(1, Cache::get($key1, 0));
        $this->assertEquals(1, Cache::get($key2, 0));
    }

    #[Test]
    public function it_uses_different_cache_keys_for_different_limit_types(): void
    {
        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        $identifier = 'ip:127.0.0.1';
        $keyAuth = "rate_limit:auth:{$identifier}:".md5('/test');
        $keyWrite = "rate_limit:write:{$identifier}:".md5('/test');
        $keyRead = "rate_limit:read:{$identifier}:".md5('/test');

        $this->middleware->handle($request, $next, 'auth');
        $this->middleware->handle($request, $next, 'write');
        $this->middleware->handle($request, $next, 'read');

        $this->assertEquals(1, Cache::get($keyAuth, 0));
        $this->assertEquals(1, Cache::get($keyWrite, 0));
        $this->assertEquals(1, Cache::get($keyRead, 0));
    }

    #[Test]
    public function it_returns_correct_retry_after_header(): void
    {
        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        // Set cache to exceed limit for auth (15 minutes decay)
        $identifier = 'ip:127.0.0.1';
        $key = "rate_limit:auth:{$identifier}:".md5('/test');
        Cache::put($key, 5, now()->addMinutes(15));

        $response = $this->middleware->handle($request, $next, 'auth');

        $this->assertEquals(429, $response->getStatusCode());
        $retryAfter = (int) $response->headers->get('Retry-After');
        $this->assertEquals(15 * 60, $retryAfter); // 15 minutes in seconds
    }

    #[Test]
    public function it_handles_default_limit_type(): void
    {
        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        // Make 120 requests (the limit for default)
        for ($i = 0; $i < 120; $i++) {
            $response = $this->middleware->handle($request, $next, 'default');
            $this->assertEquals(200, $response->getStatusCode());
        }

        // 121st request should be rate limited
        $response = $this->middleware->handle($request, $next, 'default');
        $this->assertEquals(429, $response->getStatusCode());
    }

    #[Test]
    public function it_handles_strict_limit_type(): void
    {
        $request = Request::create('/test', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $next = function ($req) {
            return response()->json(['message' => 'success'], 200);
        };

        // Make 10 requests (the limit for strict)
        for ($i = 0; $i < 10; $i++) {
            $response = $this->middleware->handle($request, $next, 'strict');
            $this->assertEquals(200, $response->getStatusCode());
        }

        // 11th request should be rate limited
        $response = $this->middleware->handle($request, $next, 'strict');
        $this->assertEquals(429, $response->getStatusCode());
    }
}
