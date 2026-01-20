<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => [
        'http://127.0.0.1:8000',
        'http://localhost:8000',
        'http://localhost:5173', // Vite dev server
        'http://127.0.0.1:5173',
        'http://localhost', // Laravel APP_URL (no port)
        'http://127.0.0.1', // Alternative localhost (no port)
    ],

    // Allow patterns for development
    'allowed_origins_patterns' => [
        '/^http:\/\/127\.0\.0\.1:\d+$/',
        '/^http:\/\/localhost:\d+$/',
    ],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,
];
