# Sentry Integration Setup

This document explains how to set up and configure Sentry for error monitoring and observability in the Resource Management SaaS application.

## Overview

Sentry provides real-time error tracking and monitoring for both:
- **Backend (Laravel/PHP)**: Captures server-side errors, exceptions, and performance issues
- **Frontend (React/TypeScript)**: Captures client-side errors, unhandled promise rejections, and React errors

## Prerequisites

1. A Sentry account (sign up at https://sentry.io)
2. A Sentry project created for your application
3. DSN (Data Source Name) from your Sentry project

## Installation

### Step 1: Install Dependencies

The dependencies are already added to `composer.json` and `package.json`. Install them:

```bash
# Backend dependencies
composer install

# Frontend dependencies
npm install
```

### Step 2: Configure Environment Variables

Add the following variables to your `.env` file:

```env
# Sentry Configuration
SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
SENTRY_ENVIRONMENT=production  # or 'local', 'staging', etc.
SENTRY_RELEASE=  # Optional: Git commit hash or version number
SENTRY_TRACES_SAMPLE_RATE=0.1  # 10% of transactions (0.0 to 1.0)
SENTRY_PROFILES_SAMPLE_RATE=0.0  # 0% of profiles (0.0 to 1.0)
SENTRY_SEND_DEFAULT_PII=false  # Don't send personally identifiable information
```

For the frontend, add to your `.env` file` or pass via Vite:

```env
# Frontend Sentry Configuration
VITE_SENTRY_DSN=https://your-sentry-dsn@sentry.io/your-project-id
VITE_SENTRY_ENVIRONMENT=production
```

**Note**: The frontend DSN can be the same as the backend DSN, or you can create separate projects for better separation.

### Step 3: Publish Sentry Configuration (Laravel)

After installing dependencies, publish the Sentry configuration:

```bash
php artisan vendor:publish --provider="Sentry\Laravel\ServiceProvider"
```

This creates `config/sentry.php` (already created in this project).

### Step 4: Test the Integration

#### Test Backend Error Tracking

Create a test route or trigger an error:

```php
// In routes/api.php or routes/web.php
Route::get('/test-sentry', function () {
    throw new \Exception('This is a test error for Sentry!');
});
```

Visit the route and check your Sentry dashboard - you should see the error appear within seconds.

#### Test Frontend Error Tracking

Open the browser console and run:

```javascript
// Test error boundary
throw new Error('Test Sentry error');

// Test unhandled promise rejection
Promise.reject(new Error('Test unhandled rejection'));
```

Check your Sentry dashboard for the errors.

## Configuration Details

### Laravel (Backend) Configuration

The configuration is in `config/sentry.php`. Key settings:

- **`dsn`**: Your Sentry DSN
- **`environment`**: Current environment (production, staging, local)
- **`traces_sample_rate`**: Percentage of transactions to trace (0.0 to 1.0)
  - `0.0` = No performance monitoring
  - `0.1` = 10% of transactions (recommended for production)
  - `1.0` = 100% of transactions (good for development)
- **`send_default_pii`**: Whether to send user data (email, username, etc.)
  - `false` = Don't send (recommended for GDPR compliance)
  - `true` = Send user data

### React (Frontend) Configuration

The configuration is in `resources/js/app.tsx`. Key settings:

- **`dsn`**: Your Sentry DSN
- **`environment`**: Current environment
- **`tracesSampleRate`**: Percentage of transactions to trace
- **`replaysSessionSampleRate`**: Percentage of sessions to record
- **`replaysOnErrorSampleRate`**: Percentage of error sessions to record (set to 1.0 to capture all errors)

### Error Boundary

The application includes an `ErrorBoundary` component (`resources/js/components/ErrorBoundary.tsx`) that:

- Catches React component errors
- Automatically reports them to Sentry
- Displays a user-friendly error message
- Provides a way to recover or navigate home

## Features

### 1. Automatic Error Capture

- **Backend**: All unhandled exceptions are automatically captured
- **Frontend**: Unhandled errors, promise rejections, and React errors are captured

### 2. Performance Monitoring

- **Backend**: Track slow database queries, API endpoints, and background jobs
- **Frontend**: Track slow page loads, API calls, and user interactions

### 3. Session Replay

- Record user sessions when errors occur
- See exactly what the user did before the error
- Helps debug UI issues

### 4. Release Tracking

- Track which version of your code caused an error
- Deploy with confidence knowing you can track issues to specific releases

### 5. User Context

- Automatically capture user information (if `send_default_pii` is enabled)
- See which users are affected by errors

## Best Practices

### 1. Environment-Specific Configuration

```env
# Production
SENTRY_ENVIRONMENT=production
SENTRY_TRACES_SAMPLE_RATE=0.1

# Staging
SENTRY_ENVIRONMENT=staging
SENTRY_TRACES_SAMPLE_RATE=0.5

# Local Development
SENTRY_ENVIRONMENT=local
SENTRY_TRACES_SAMPLE_RATE=1.0
```

### 2. Sample Rates

- **Production**: Lower sample rates (0.1) to reduce overhead
- **Development**: Higher sample rates (1.0) to catch all issues
- **Error Replays**: Always set `replaysOnErrorSampleRate` to 1.0 to capture all error sessions

### 3. Privacy and GDPR

- Set `SENTRY_SEND_DEFAULT_PII=false` to avoid sending user data
- Configure `before_send` callbacks to filter sensitive data
- Review Sentry's data retention policies

### 4. Ignoring Specific Errors

You can ignore specific exceptions in `config/sentry.php`:

```php
'ignore_exceptions' => [
    \Symfony\Component\HttpKernel\Exception\NotFoundHttpException::class,
    \Illuminate\Auth\AuthenticationException::class,
],
```

### 5. Custom Context

Add custom context to errors:

```php
// Backend
\Sentry\configureScope(function (\Sentry\State\Scope $scope): void {
    $scope->setTag('feature', 'checkout');
    $scope->setContext('user', [
        'id' => auth()->id(),
        'email' => auth()->user()->email,
    ]);
});
```

```javascript
// Frontend
Sentry.setTag('feature', 'checkout');
Sentry.setContext('user', {
    id: user.id,
    email: user.email,
});
```

## Monitoring and Alerts

### Setting Up Alerts in Sentry

1. Go to your Sentry project
2. Navigate to **Alerts** → **Create Alert Rule**
3. Configure:
   - **Trigger**: When an issue is created or frequency threshold is met
   - **Conditions**: Error rate, affected users, etc.
   - **Actions**: Email, Slack, PagerDuty, etc.

### Recommended Alerts

- **Critical Errors**: Any error with level "fatal" or "error"
- **High Frequency**: Errors occurring more than 10 times in 5 minutes
- **New Issues**: New error types that haven't been seen before
- **Performance Degradation**: API endpoints taking longer than 2 seconds

## Troubleshooting

### Errors Not Appearing in Sentry

1. **Check DSN**: Verify the DSN is correct in `.env`
2. **Check Environment**: Ensure `SENTRY_ENVIRONMENT` matches your Sentry project
3. **Check Network**: Ensure your server can reach `sentry.io`
4. **Check Logs**: Look for Sentry-related errors in Laravel logs

### Performance Impact

- Sentry is designed to be non-blocking
- Errors are sent asynchronously
- Sample rates control overhead
- If you notice performance issues, reduce sample rates

## Resources

- [Sentry Laravel Documentation](https://docs.sentry.io/platforms/php/guides/laravel/)
- [Sentry React Documentation](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Sentry Best Practices](https://docs.sentry.io/product/best-practices/)

## Support

For issues with Sentry integration, check:
1. Sentry dashboard for error details
2. Laravel logs (`storage/logs/laravel.log`)
3. Browser console for frontend errors
4. Sentry documentation
