<?php

namespace App\Http\Controllers\Api\V1;

use App\Domains\Auth\Services\AuthService;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Requests\Auth\RegisterRequest;
use Illuminate\Http\Request;

class AuthController extends BaseController
{
    public function __construct(
        protected AuthService $authService
    ) {}

    public function register(RegisterRequest $request)
    {
        $data = $this->authService->register($request->validated());

        return $this->success($data, 'Registration successful', 201);
    }

    public function login(LoginRequest $request)
    {
        $validated = $request->validated();
        $data = $this->authService->login($validated['email'], $validated['password']);

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

        return $this->success($data);
    }
}
