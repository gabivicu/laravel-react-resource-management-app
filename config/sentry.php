<?php

// Get DSN and validate it
$dsn = env('SENTRY_LARAVEL_DSN', env('SENTRY_DSN'));

// Only set DSN if it's a valid Sentry DSN format
// Valid format: https://<key>@<host>/<project_id>
if ($dsn && (strpos($dsn, '@') === false || strpos($dsn, 'sentry.io') === false)) {
    // Invalid DSN format - don't set it, Sentry will be disabled
    $dsn = null;
}

$config = [
    'dsn' => $dsn,

    // When left empty or `null` the Laravel environment will be used
    'environment' => env('SENTRY_ENVIRONMENT', env('APP_ENV', 'production')),

    // @see: https://docs.sentry.io/platforms/php/guides/laravel/configuration/options/#traces-sample-rate
    // Convert string to float (env() returns string)
    'traces_sample_rate' => (float) env('SENTRY_TRACES_SAMPLE_RATE', 0.0),

    // @see: https://docs.sentry.io/platforms/php/guides/laravel/configuration/options/#profiles-sample-rate
    // Convert string to float (env() returns string)
    'profiles_sample_rate' => (float) env('SENTRY_PROFILES_SAMPLE_RATE', 0.0),

    // @see: https://docs.sentry.io/platforms/php/guides/laravel/configuration/options/#send-default-pii
    'send_default_pii' => env('SENTRY_SEND_DEFAULT_PII', false),

    // @see: https://docs.sentry.io/platforms/php/guides/laravel/configuration/options/#ignore-exceptions
    'ignore_exceptions' => [
        // Example: \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
    ],

    // @see: https://docs.sentry.io/platforms/php/guides/laravel/configuration/options/#ignore-transactions
    'ignore_transactions' => [
        // Example: 'GET /health',
    ],
];

// Only add optional config if they are set
if (env('SENTRY_RELEASE')) {
    $config['release'] = env('SENTRY_RELEASE');
}

if (env('SENTRY_SERVER_NAME')) {
    $config['server_name'] = env('SENTRY_SERVER_NAME');
}

return $config;
