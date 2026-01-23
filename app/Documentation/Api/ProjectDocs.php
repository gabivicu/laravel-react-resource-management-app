<?php

namespace App\Documentation\Api;

use OpenApi\Attributes as OA;

#[OA\Tag(
    name: 'Projects',
    description: 'API Endpoints for Project Management'
)]
class ProjectDocs
{
    #[OA\Get(
        path: '/projects',
        summary: 'List projects',
        description: 'Get a paginated list of projects filtered by search term or status',
        tags: ['Projects'],
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
                name: 'search',
                in: 'query',
                description: 'Search term for project title or description',
                required: false,
                schema: new OA\Schema(type: 'string')
            ),
            new OA\Parameter(
                name: 'status',
                in: 'query',
                description: 'Filter by project status',
                required: false,
                schema: new OA\Schema(type: 'string', enum: ['active', 'completed', 'on_hold', 'cancelled'])
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Successful operation',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Projects retrieved successfully'),
                        new OA\Property(
                            property: 'data',
                            type: 'array',
                            items: new OA\Items(
                                properties: [
                                    new OA\Property(property: 'id', type: 'integer', example: 1),
                                    new OA\Property(property: 'title', type: 'string', example: 'Website Redesign'),
                                    new OA\Property(property: 'status', type: 'string', example: 'active'),
                                    new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
                                ]
                            )
                        ),
                        new OA\Property(
                            property: 'pagination',
                            properties: [
                                new OA\Property(property: 'current_page', type: 'integer', example: 1),
                                new OA\Property(property: 'last_page', type: 'integer', example: 5),
                                new OA\Property(property: 'per_page', type: 'integer', example: 15),
                                new OA\Property(property: 'total', type: 'integer', example: 75),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(response: 401, description: 'Unauthenticated'),
        ]
    )]
    public function index() {}

    #[OA\Post(
        path: '/projects',
        summary: 'Create a new project',
        description: 'Create a new project in the current organization',
        tags: ['Projects'],
        security: [['bearerAuth' => []]],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                required: ['title', 'description', 'status'],
                properties: [
                    new OA\Property(property: 'title', type: 'string', example: 'New Mobile App'),
                    new OA\Property(property: 'description', type: 'string', example: 'Development of the iOS application'),
                    new OA\Property(property: 'status', type: 'string', enum: ['active', 'completed', 'on_hold', 'cancelled'], example: 'active'),
                    new OA\Property(property: 'start_date', type: 'string', format: 'date', example: '2024-01-01'),
                    new OA\Property(property: 'end_date', type: 'string', format: 'date', example: '2024-12-31'),
                    new OA\Property(property: 'budget', type: 'number', format: 'float', example: 50000.00),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 201,
                description: 'Project created successfully',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'success', type: 'boolean', example: true),
                        new OA\Property(property: 'message', type: 'string', example: 'Project created successfully'),
                        new OA\Property(
                            property: 'data',
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 1),
                                new OA\Property(property: 'title', type: 'string', example: 'New Mobile App'),
                                new OA\Property(property: 'status', type: 'string', example: 'active'),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(response: 400, description: 'Bad Request'),
            new OA\Response(response: 401, description: 'Unauthenticated'),
            new OA\Response(response: 422, description: 'Validation Error'),
        ]
    )]
    public function store() {}

    #[OA\Get(
        path: '/projects/{id}',
        summary: 'Get project details',
        tags: ['Projects'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
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
                            properties: [
                                new OA\Property(property: 'id', type: 'integer', example: 1),
                                new OA\Property(property: 'title', type: 'string', example: 'Website Redesign'),
                                new OA\Property(property: 'description', type: 'string', example: 'Full redesign'),
                                new OA\Property(property: 'status', type: 'string', example: 'active'),
                                new OA\Property(property: 'created_at', type: 'string', format: 'date-time'),
                            ],
                            type: 'object'
                        ),
                    ]
                )
            ),
            new OA\Response(response: 404, description: 'Project not found'),
        ]
    )]
    public function show() {}

    #[OA\Put(
        path: '/projects/{id}',
        summary: 'Update project',
        tags: ['Projects'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                description: 'Project ID',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        requestBody: new OA\RequestBody(
            required: true,
            content: new OA\JsonContent(
                properties: [
                    new OA\Property(property: 'title', type: 'string'),
                    new OA\Property(property: 'description', type: 'string'),
                    new OA\Property(property: 'status', type: 'string'),
                ]
            )
        ),
        responses: [
            new OA\Response(
                response: 200,
                description: 'Project updated successfully'
            ),
            new OA\Response(response: 404, description: 'Project not found'),
        ]
    )]
    public function update() {}

    #[OA\Delete(
        path: '/projects/{id}',
        summary: 'Delete project',
        tags: ['Projects'],
        security: [['bearerAuth' => []]],
        parameters: [
            new OA\Parameter(
                name: 'id',
                in: 'path',
                description: 'Project ID',
                required: true,
                schema: new OA\Schema(type: 'integer')
            ),
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Project deleted successfully'
            ),
            new OA\Response(response: 404, description: 'Project not found'),
        ]
    )]
    public function destroy() {}
}
