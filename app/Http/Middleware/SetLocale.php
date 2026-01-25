<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\App;
use Symfony\Component\HttpFoundation\Response;

class SetLocale
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Get locale from request header, query parameter, or default to config
        $locale = $request->header('Accept-Language', $request->query('locale', config('app.locale')));

        // Extract language code (e.g., 'en' from 'en-US' or 'ro' from 'ro-RO')
        $locale = substr($locale, 0, 2);

        // Validate locale (only allow 'en' and 'ro')
        if (! in_array($locale, ['en', 'ro'])) {
            $locale = config('app.locale');
        }

        // Set the application locale
        App::setLocale($locale);

        return $next($request);
    }
}
