<?php

namespace Tests\Unit;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class RateLimiterConfigurationTest extends TestCase
{
    protected function setUp(): void
    {
        parent::setUp();
        // Clear rate limiters before each test
        RateLimiter::clear('auth');
        RateLimiter::clear('api-write');
        RateLimiter::clear('api-read');
        RateLimiter::clear('api');
    }

    #[Test]
    public function it_configures_auth_rate_limiter(): void
    {
        $request = Request::create('/api/v1/auth/login', 'POST');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        // Check if rate limiter is configured
        $limiter = RateLimiter::limiter('auth');
        $this->assertNotNull($limiter);

        // Get the limit
        $limit = $limiter($request);
        $this->assertNotNull($limit);
    }

    #[Test]
    public function auth_rate_limiter_allows_5_requests_per_minute(): void
    {
        $request = Request::create('/api/v1/auth/login', 'POST');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $limiter = RateLimiter::limiter('auth');
        $limit = $limiter($request);

        // The limit should be 5 per minute
        $this->assertEquals(5, $limit->maxAttempts);
    }

    #[Test]
    public function auth_rate_limiter_uses_ip_address(): void
    {
        $request1 = Request::create('/api/v1/auth/login', 'POST');
        $request1->server->set('REMOTE_ADDR', '192.168.1.1');

        $request2 = Request::create('/api/v1/auth/login', 'POST');
        $request2->server->set('REMOTE_ADDR', '192.168.1.2');

        $limiter = RateLimiter::limiter('auth');
        $limit1 = $limiter($request1);
        $limit2 = $limiter($request2);

        // Different IPs should have different keys
        $this->assertNotEquals($limit1->key, $limit2->key);
    }

    #[Test]
    public function it_configures_api_write_rate_limiter(): void
    {
        $request = Request::create('/api/v1/projects', 'POST');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $limiter = RateLimiter::limiter('api-write');
        $this->assertNotNull($limiter);

        $limit = $limiter($request);
        $this->assertNotNull($limit);
    }

    #[Test]
    public function api_write_rate_limiter_allows_60_requests_per_minute(): void
    {
        $request = Request::create('/api/v1/projects', 'POST');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $limiter = RateLimiter::limiter('api-write');
        $limit = $limiter($request);

        $this->assertEquals(60, $limit->maxAttempts);
    }

    #[Test]
    public function api_write_rate_limiter_uses_user_id_when_authenticated(): void
    {
        $user = new class
        {
            public $id = 123;
        };

        $request = Request::create('/api/v1/projects', 'POST');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');
        $request->setUserResolver(function () use ($user) {
            return $user;
        });

        $limiter = RateLimiter::limiter('api-write');
        $limit = $limiter($request);

        // Should use user ID in key
        $this->assertStringContainsString('user:123', $limit->key);
    }

    #[Test]
    public function api_write_rate_limiter_uses_ip_when_not_authenticated(): void
    {
        $request = Request::create('/api/v1/projects', 'POST');
        $request->server->set('REMOTE_ADDR', '192.168.1.100');

        $limiter = RateLimiter::limiter('api-write');
        $limit = $limiter($request);

        // Should use IP in key
        $this->assertStringContainsString('ip:192.168.1.100', $limit->key);
    }

    #[Test]
    public function it_configures_api_read_rate_limiter(): void
    {
        $request = Request::create('/api/v1/projects', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $limiter = RateLimiter::limiter('api-read');
        $this->assertNotNull($limiter);

        $limit = $limiter($request);
        $this->assertNotNull($limit);
    }

    #[Test]
    public function api_read_rate_limiter_allows_300_requests_per_minute(): void
    {
        $request = Request::create('/api/v1/projects', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $limiter = RateLimiter::limiter('api-read');
        $limit = $limiter($request);

        $this->assertEquals(300, $limit->maxAttempts);
    }

    #[Test]
    public function it_configures_general_api_rate_limiter(): void
    {
        $request = Request::create('/api/v1/endpoint', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $limiter = RateLimiter::limiter('api');
        $this->assertNotNull($limiter);

        $limit = $limiter($request);
        $this->assertNotNull($limit);
    }

    #[Test]
    public function general_api_rate_limiter_allows_120_requests_per_minute(): void
    {
        $request = Request::create('/api/v1/endpoint', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $limiter = RateLimiter::limiter('api');
        $limit = $limiter($request);

        $this->assertEquals(120, $limit->maxAttempts);
    }

    #[Test]
    public function read_rate_limiter_allows_more_requests_than_write(): void
    {
        $request = Request::create('/api/v1/endpoint', 'GET');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $readLimiter = RateLimiter::limiter('api-read');
        $writeLimiter = RateLimiter::limiter('api-write');

        $readLimit = $readLimiter($request);
        $writeLimit = $writeLimiter($request);

        $this->assertGreaterThan($writeLimit->maxAttempts, $readLimit->maxAttempts);
    }

    #[Test]
    public function auth_rate_limiter_is_stricter_than_general_api(): void
    {
        $request = Request::create('/api/v1/endpoint', 'POST');
        $request->server->set('REMOTE_ADDR', '127.0.0.1');

        $authLimiter = RateLimiter::limiter('auth');
        $apiLimiter = RateLimiter::limiter('api');

        $authLimit = $authLimiter($request);
        $apiLimit = $apiLimiter($request);

        $this->assertLessThan($apiLimit->maxAttempts, $authLimit->maxAttempts);
    }
}
