<?php

namespace App\Http\Requests\ResourceAllocation;

use Illuminate\Contracts\Validation\Validator;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateResourceAllocationRequest extends FormRequest
{
    public function authorize(): bool
    {
        // Authorization is handled in the controller after loading the allocation
        // This allows the controller to load the allocation first, then check authorization
        return true;
    }

    public function rules(): array
    {
        return [
            'project_id' => ['sometimes', 'required', 'integer', 'exists:projects,id'],
            'user_id' => ['sometimes', 'required', 'integer', 'exists:users,id'],
            'role' => ['nullable', 'string', 'max:255'],
            'allocation_percentage' => ['sometimes', 'required', 'numeric', 'min:0', 'max:100'],
            'start_date' => ['sometimes', 'required', 'date'],
            'end_date' => ['nullable', 'date', 'after:start_date'],
            'notes' => ['nullable', 'string'],
        ];
    }

    public function messages(): array
    {
        return [
            'project_id.exists' => 'Selected project does not exist.',
            'user_id.exists' => 'Selected user does not exist.',
            'allocation_percentage.numeric' => 'Allocation percentage must be a number.',
            'allocation_percentage.min' => 'Allocation percentage must be at least 0%.',
            'allocation_percentage.max' => 'Allocation percentage cannot exceed 100%.',
            'start_date.date' => 'Start date must be a valid date.',
            'end_date.date' => 'End date must be a valid date.',
            'end_date.after' => 'End date must be after start date.',
        ];
    }

    protected function failedValidation(Validator $validator): void
    {
        throw new HttpResponseException(
            response()->json([
                'success' => false,
                'message' => 'Validation failed',
                'errors' => $validator->errors(),
            ], 422)
        );
    }
}
