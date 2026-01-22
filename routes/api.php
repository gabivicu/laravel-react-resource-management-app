<?php

use App\Http\Controllers\Api\V1\AnalyticsController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ProjectController;
use App\Http\Controllers\Api\V1\ResourceAllocationController;
use App\Http\Controllers\Api\V1\RoleController;
use App\Http\Controllers\Api\V1\TaskController;
use App\Http\Controllers\Api\V1\UserController;
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

// V1 Routes
Route::prefix('v1')->group(function () {

    // Auth Routes
    Route::prefix('auth')->group(function () {
        Route::post('/register', [AuthController::class, 'register']);
        Route::post('/login', [AuthController::class, 'login']);

        Route::middleware('auth:sanctum')->group(function () {
            Route::post('/logout', [AuthController::class, 'logout']);
            Route::get('/user', [AuthController::class, 'user']);
        });
    });

    // Projects Routes
    Route::middleware('auth:sanctum')->group(function () {
        Route::apiResource('projects', ProjectController::class);

        // Tasks Routes
        Route::get('tasks/kanban', [TaskController::class, 'kanban']);
        Route::post('tasks/{id}/order', [TaskController::class, 'updateOrder']);
        Route::apiResource('tasks', TaskController::class);

        // Resource Allocations Routes
        Route::apiResource('resource-allocations', ResourceAllocationController::class);

        // User Management Routes
        Route::get('users', [UserController::class, 'index']);
        Route::get('users/{id}', [UserController::class, 'show']);
        Route::put('users/{id}', [UserController::class, 'update']);
        Route::post('users/{id}/assign-role', [UserController::class, 'assignRole']);
        Route::post('users/{id}/remove-role', [UserController::class, 'removeRole']);

        // Role Management Routes
        Route::get('roles', [RoleController::class, 'index']);
        Route::get('roles/permissions', [RoleController::class, 'permissions']);
        Route::post('roles', [RoleController::class, 'store']);
        Route::get('roles/{id}', [RoleController::class, 'show']);
        Route::put('roles/{id}', [RoleController::class, 'update']);
        Route::delete('roles/{id}', [RoleController::class, 'destroy']);

        // Analytics Routes
        Route::prefix('analytics')->group(function () {
            Route::get('dashboard', [AnalyticsController::class, 'dashboard']);
            Route::get('projects', [AnalyticsController::class, 'projects']);
            Route::get('tasks', [AnalyticsController::class, 'tasks']);
            Route::get('resources', [AnalyticsController::class, 'resources']);
            Route::get('task-completion-trend', [AnalyticsController::class, 'taskCompletionTrend']);
        });
    });
});
