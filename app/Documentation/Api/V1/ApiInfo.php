<?php

namespace App\Documentation\Api\V1;

use OpenApi\Attributes as OA;

#[OA\Info(
    version: '1.0.0',
    title: 'Resource Management API',
    description: 'API Documentation for the Resource Management Application',
    contact: new OA\Contact(
        email: 'admin@example.com'
    )
)]
#[OA\Server(
    url: '/api/v1',
    description: 'API V1 Server'
)]
#[OA\SecurityScheme(
    securityScheme: 'bearerAuth',
    type: 'http',
    scheme: 'bearer',
    bearerFormat: 'JWT'
)]
class ApiInfo {}
