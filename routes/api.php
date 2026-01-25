<?php

use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\ResourceAllocationController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\UserController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Broadcast;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| is assigned the "api" middleware group. Enjoy building your API!
|
*/

Broadcast::routes(['middleware' => ['auth:sanctum']]);

// V1 Routes
Route::prefix('v1')->group(function () {

    // Test helper endpoint - only available in non-production environments
    // This endpoint clears rate limiting cache for the current IP
    if (app()->environment(['local', 'testing'])) {
        Route::post('/test/clear-rate-limit', function (Request $request) {
            $ip = $request->ip();
            $patterns = [
                "rate_limit:*:ip:{$ip}:*",
                'rate_limit:*:user:*:*',
                "violations:ip:{$ip}",
            ];

            foreach ($patterns as $pattern) {
                // Clear cache keys matching the pattern
                // Note: This is a simplified approach - in production you'd use Redis SCAN or similar
                Cache::flush(); // For testing, we can flush all cache
            }

            return response()->json(['message' => 'Rate limit cache cleared for testing']);
        })->withoutMiddleware(['throttle', 'rate.limit.advanced']);
    }

    // Auth Routes - Strict rate limiting for authentication endpoints
    Route::prefix('auth')->group(function () {
        // Public auth routes with strict rate limiting
        Route::post('/register', [AuthController::class, 'register'])
            ->middleware(['throttle:auth', 'rate.limit.advanced:auth']);
        Route::post('/login', [AuthController::class, 'login'])
            ->middleware(['throttle:auth', 'rate.limit.advanced:auth']);

        // Protected auth routes
        Route::middleware(['auth:sanctum', 'throttle:api-write'])->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/user', [AuthController::class, 'user'])
                ->middleware('throttle:api-read');
        });
    });

    // Protected Routes - All require authentication
    Route::middleware('auth:sanctum')->group(function () {

        // Read operations - More permissive rate limiting
        Route::middleware('throttle:api-read')->group(function () {
            // Projects - Read
            Route::get('projects', [ProjectController::class, 'index']);
            Route::get('projects/{project}', [ProjectController::class, 'show']);

            // Tasks - Read
            // IMPORTANT: Specific routes (like 'kanban') must be defined BEFORE parameterized routes (like '{task}')
            Route::get('tasks', [TaskController::class, 'index']);
            Route::get('tasks/kanban', [TaskController::class, 'kanban']);
            Route::get('tasks/{task}', [TaskController::class, 'show']);

            // Resource Allocations - Read
            Route::get('resource-allocations', [ResourceAllocationController::class, 'index']);
            Route::get('resource-allocations/{resourceAllocation}', [ResourceAllocationController::class, 'show']);

            // Users - Read
            Route::get('users', [UserController::class, 'index']);
            Route::get('users/{id}', [UserController::class, 'show']);

            // Roles - Read
            Route::get('roles', [RoleController::class, 'index']);
            Route::get('roles/{id}', [RoleController::class, 'show']);
            Route::get('roles/permissions', [RoleController::class, 'permissions']);

            // Analytics Routes - Read-only
            Route::prefix('analytics')->group(function () {
                Route::get('dashboard', [AnalyticsController::class, 'dashboard']);
                Route::get('projects', [AnalyticsController::class, 'projects']);
                Route::get('tasks', [AnalyticsController::class, 'tasks']);
                Route::get('resources', [AnalyticsController::class, 'resources']);
                Route::get('task-completion-trend', [AnalyticsController::class, 'taskCompletionTrend']);
            });
        });

        // Write operations - Stricter rate limiting with advanced protection
        Route::middleware(['throttle:api-write', 'rate.limit.advanced:write'])->group(function () {
            // Projects - Write
            Route::post('projects', [ProjectController::class, 'store']);
            Route::put('projects/{project}', [ProjectController::class, 'update']);
            Route::patch('projects/{project}', [ProjectController::class, 'update']);
            Route::delete('projects/{project}', [ProjectController::class, 'destroy']);

            // Tasks - Write
            Route::post('tasks', [TaskController::class, 'store']);
            Route::put('tasks/{task}', [TaskController::class, 'update']);
            Route::patch('tasks/{task}', [TaskController::class, 'update']);
            Route::delete('tasks/{task}', [TaskController::class, 'destroy']);
            Route::post('tasks/{id}/order', [TaskController::class, 'updateOrder']);

            // Resource Allocations - Write
            Route::post('resource-allocations', [ResourceAllocationController::class, 'store']);
            Route::put('resource-allocations/{resourceAllocation}', [ResourceAllocationController::class, 'update']);
            Route::patch('resource-allocations/{resourceAllocation}', [ResourceAllocationController::class, 'update']);
            Route::delete('resource-allocations/{resourceAllocation}', [ResourceAllocationController::class, 'destroy']);

            // Users - Write
            Route::put('users/{id}', [UserController::class, 'update']);
            Route::patch('users/{id}', [UserController::class, 'update']);
            Route::post('users/{id}/assign-role', [UserController::class, 'assignRole']);
            Route::post('users/{id}/remove-role', [UserController::class, 'removeRole']);

            // Roles - Write
            Route::post('roles', [RoleController::class, 'store']);
            Route::put('roles/{id}', [RoleController::class, 'update']);
            Route::patch('roles/{id}', [RoleController::class, 'update']);
            Route::delete('roles/{id}', [RoleController::class, 'destroy']);
        });
    });
});
