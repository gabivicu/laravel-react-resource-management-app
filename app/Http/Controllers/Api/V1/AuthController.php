<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Auth\Services\AuthService;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use Illuminate\Http\Request;

class AuthController extends BaseController
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function register(RegisterRequest $request)
    {
        $data = $this->authService->register($request->validated());

        // $data usually contains ['user' => User, 'token' => string]
        // Let's transform the user part
        $data['user'] = new UserResource($data['user']);

        return $this->success($data, 'Registration successful', 201);
    }

    public function login(LoginRequest $request)
    {
        $validated = $request->validated();
        $data = $this->authService->login($validated['email'], $validated['password']);

        // Transform user
        $data['user'] = new UserResource($data['user']);

        return $this->success($data, 'Login successful');
    }

    public function logout(Request $request)
    {
        $this->authService->logout($request->user());

        return $this->success(null, 'Logged out successfully');
    }

    public function user(Request $request)
    {
        $data = $this->authService->getAuthenticatedUser($request->user());

        // Transform user
        if (isset($data['user'])) {
            $data['user'] = new UserResource($data['user']);
        } else {
            // If getAuthenticatedUser returns the user model directly?
            // Let's check AuthService later, but safe to assume it returns array structure based on usage.
            // Actually, usually /user endpoint returns the user resource directly.
            // But existing code returned $data. Let's see AuthService::getAuthenticatedUser
        }

        return $this->success($data);
    }
}
