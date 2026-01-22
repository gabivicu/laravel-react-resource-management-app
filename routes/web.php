<?php

use Illuminate\Support\Facades\Route;

// Root route
Route::get('/', function () {
    return view('welcome');
});

// Catch-all route for SPA - all routes (except API and assets) should return welcome.blade.php
// This allows React Router to handle client-side routing
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '^(?!api|build|storage|hot).*$');
