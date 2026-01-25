<?php

namespace App\Core\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

/**
 * Advanced Rate Limiting Middleware
 *
 * Provides sophisticated rate limiting with:
 * - IP-based and user-based rate limiting
 * - Different limits for different route types
 * - Automatic blocking of suspicious IPs
 * - Detailed logging for security monitoring
 */
class AdvancedRateLimitingMiddleware
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, string $limitType = 'default'): Response
    {
        // Skip rate limiting in local environment
        if (app()->environment('local')) {
            return $next($request);
        }

        $identifier = $this->getIdentifier($request);
        $key = $this->getCacheKey($identifier, $limitType, $request->path());

        // Check if IP is blocked
        if ($this->isBlocked($identifier)) {
            Log::warning('Blocked request from IP', [
                'ip' => $identifier,
                'path' => $request->path(),
                'user_agent' => $request->userAgent(),
            ]);

            return response()->json([
                'message' => 'Your IP has been temporarily blocked due to excessive requests.',
                'error' => 'rate_limit_exceeded',
            ], 429);
        }

        // Get rate limit configuration
        $limits = $this->getLimits($limitType);
        $maxAttempts = $limits['max_attempts'];
        $decayMinutes = $limits['decay_minutes'];

        // Check current rate
        $attempts = Cache::get($key, 0);

        if ($attempts >= $maxAttempts) {
            // Log the rate limit violation
            Log::warning('Rate limit exceeded', [
                'identifier' => $identifier,
                'path' => $request->path(),
                'method' => $request->method(),
                'attempts' => $attempts,
                'limit' => $maxAttempts,
                'user_agent' => $request->userAgent(),
            ]);

            // Track violations for automatic blocking
            $this->trackViolation($identifier);

            return response()->json([
                'message' => 'Too many requests. Please try again later.',
                'error' => 'rate_limit_exceeded',
                'retry_after' => $decayMinutes * 60,
            ], 429)->withHeaders([
                'Retry-After' => $decayMinutes * 60,
                'X-RateLimit-Limit' => $maxAttempts,
                'X-RateLimit-Remaining' => 0,
            ]);
        }

        // Increment counter
        Cache::put($key, $attempts + 1, now()->addMinutes($decayMinutes));

        // Process request
        $response = $next($request);

        // Add rate limit headers to response
        $remaining = max(0, $maxAttempts - ($attempts + 1));
        $response->headers->set('X-RateLimit-Limit', $maxAttempts);
        $response->headers->set('X-RateLimit-Remaining', $remaining);
        $response->headers->set('X-RateLimit-Reset', now()->addMinutes($decayMinutes)->timestamp);

        return $response;
    }

    /**
     * Get identifier for rate limiting (IP or user ID)
     */
    protected function getIdentifier(Request $request): string
    {
        // If user is authenticated, use user ID for more accurate limiting
        if ($request->user()) {
            return 'user:'.$request->user()->getAuthIdentifier();
        }

        // Otherwise use IP address
        return 'ip:'.$request->ip();
    }

    /**
     * Get cache key for rate limiting
     */
    protected function getCacheKey(string $identifier, string $limitType, string $path): string
    {
        return "rate_limit:{$limitType}:{$identifier}:".md5($path);
    }

    /**
     * Get rate limit configuration based on type
     */
    protected function getLimits(string $limitType): array
    {
        return match ($limitType) {
            'auth' => [
                'max_attempts' => 5,      // 5 login attempts per 15 minutes
                'decay_minutes' => 15,
            ],
            'write' => [
                'max_attempts' => 60,      // 60 write operations per minute
                'decay_minutes' => 1,
            ],
            'read' => [
                'max_attempts' => 300,    // 300 read operations per minute
                'decay_minutes' => 1,
            ],
            'strict' => [
                'max_attempts' => 10,      // 10 requests per minute
                'decay_minutes' => 1,
            ],
            default => [
                'max_attempts' => 120,     // 120 requests per minute
                'decay_minutes' => 1,
            ],
        };
    }

    /**
     * Track rate limit violations for automatic blocking
     */
    protected function trackViolation(string $identifier): void
    {
        $violationKey = "rate_limit_violations:{$identifier}";
        $violations = Cache::get($violationKey, 0);
        $violations++;

        // Block IP after 10 violations in 1 hour
        if ($violations >= 10) {
            $this->blockIdentifier($identifier);
        } else {
            Cache::put($violationKey, $violations, now()->addHour());
        }
    }

    /**
     * Block an identifier (IP or user)
     */
    protected function blockIdentifier(string $identifier): void
    {
        $blockKey = "rate_limit_blocked:{$identifier}";
        Cache::put($blockKey, true, now()->addHours(24)); // Block for 24 hours

        Log::critical('IP/User automatically blocked due to excessive rate limit violations', [
            'identifier' => $identifier,
            'blocked_until' => now()->addHours(24)->toIso8601String(),
        ]);
    }

    /**
     * Check if identifier is blocked
     */
    protected function isBlocked(string $identifier): bool
    {
        $blockKey = "rate_limit_blocked:{$identifier}";

        return Cache::has($blockKey);
    }
}
