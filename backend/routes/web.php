<?php

use Illuminate\Support\Facades\Route;

/*
| Redirect convenience for guests: the auth middleware (and the SPA
| on desktop browsers hitting the API directly) expects a named
| `login` route. Authentication for the application itself happens
| on the Next.js frontend.
*/
Route::get('/login', function () {
    return redirect()->away(
        rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/').'/login'
    );
})->name('login');

Route::get('/', function () {
    return view('welcome');
});
