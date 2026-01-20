<?php

use Illuminate\Support\Facades\Route;

// Ruta root
Route::get('/', function () {
    return view('welcome');
});

// Catch-all route pentru SPA - toate rutele (exceptând API și asset-uri) trebuie să returneze welcome.blade.php
// Aceasta permite React Router să gestioneze rutele client-side
Route::get('/{any}', function () {
    return view('welcome');
})->where('any', '^(?!api|build|storage|hot).*$');
