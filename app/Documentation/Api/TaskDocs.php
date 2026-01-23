<?php

namespace App\Documentation\Api;

use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Tasks',
    description: 'API Endpoints for Task Management'
)]
class TaskDocs
{
    #[OA\Get(
        path: '/tasks',
        summary: 'List tasks',
        description: 'Get a paginated list of tasks filtered by project, status or priority',
        tags: ['Tasks'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'page',
                in: 'query',
                description: 'Page number',
                required: false,
                schema: new OA\Schema(type: 'integer', default: 1)
            ),
            new OA\Parameter(
                name: 'per_page',
                in: 'query',
                description: 'Items per page',
                required: false,
                schema: new OA\Schema(type: 'integer', default: 15)
            ),
            new OA\Parameter(
                name: 'project_id',
                in: 'query',
                description: 'Filter by project ID',
                required: false,
                schema: new OA\Schema(type: 'integer')
            ),
            new OA\Parameter(
                name: 'status',
                in: 'query',
                description: 'Filter by status',
                required: false,
                schema: new OA\Schema(type: 'string', enum: ['todo', 'in_progress', 'review', 'done'])
            ),
            new OA\Parameter(
                name: 'priority',
                in: 'query',
                description: 'Filter by priority',
                required: false,
                schema: new OA\Schema(type: 'string', enum: ['low', 'medium', 'high', 'urgent'])
            ),
            new OA\Parameter(
                name: 'search',
                in: 'query',
                description: 'Search term',
                required: false,
                schema: new OA\Schema(type: 'string')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'id', type: 'integer', example: 1),
                                    new OA\Property(property: 'title', type: 'string', example: 'Implement Login'),
                                    new OA\Property(property: 'status', type: 'string', example: 'in_progress'),
                                    new OA\Property(property: 'priority', type: 'string', example: 'high'),
                                ]
                            )
                        ),
                    ]
                )
            ),
        ]
    )]
    public function index() {}

    #[OA\Get(
        path: '/tasks/kanban',
        summary: 'Get Kanban tasks',
        description: 'Get tasks grouped by status for Kanban board view',
        tags: ['Tasks'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'project_id',
                in: 'query',
                description: 'Project ID',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(
                            property: 'data',
                            type: 'object',
                            additionalProperties: new OA\AdditionalProperties(
                                type: 'array',
                                items: new OA\Items(type: 'object')
                            ),
                            example: ['todo' => [], 'in_progress' => [], 'done' => []]
                        ),
                    ]
                )
            ),
        ]
    )]
    public function kanban() {}

    #[OA\Post(
        path: '/tasks',
        summary: 'Create a new task',
        tags: ['Tasks'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['title', 'project_id'],
                properties: [
                    new OA\Property(property: 'title', type: 'string', example: 'Fix navigation bug'),
                    new OA\Property(property: 'description', type: 'string', example: 'Navigation menu is not responsive'),
                    new OA\Property(property: 'project_id', type: 'integer', example: 1),
                    new OA\Property(property: 'priority', type: 'string', enum: ['low', 'medium', 'high', 'urgent'], example: 'high'),
                    new OA\Property(property: 'status', type: 'string', enum: ['todo', 'in_progress', 'review', 'done'], example: 'todo'),
                    new OA\Property(property: 'due_date', type: 'string', format: 'date', example: '2024-02-01'),
                    new OA\Property(property: 'assignees', type: 'array', items: new OA\Items(type: 'integer'), example: [1, 2]),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Task created successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 10),
                                new OA\Property(property: 'title', type: 'string', example: 'Fix navigation bug'),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
        ]
    )]
    public function store() {}

    #[OA\Get(
        path: '/tasks/{id}',
        summary: 'Get task details',
        tags: ['Tasks'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Successful operation'),
            new OA\Response(response: 404, description: 'Task not found'),
        ]
    )]
    public function show() {}

    #[OA\Put(
        path: '/tasks/{id}',
        summary: 'Update task',
        tags: ['Tasks'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'title', type: 'string'),
                    new OA\Property(property: 'description', type: 'string'),
                    new OA\Property(property: 'status', type: 'string'),
                    new OA\Property(property: 'priority', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(response: 200, description: 'Task updated successfully'),
        ]
    )]
    public function update() {}

    #[OA\Delete(
        path: '/tasks/{id}',
        summary: 'Delete task',
        tags: ['Tasks'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(name: 'id', in: 'path', required: true, schema: new OA\Schema(type: 'integer')),
        ],
        responses: [
            new OA\Response(response: 200, description: 'Task deleted successfully'),
        ]
    )]
    public function destroy() {}
}
