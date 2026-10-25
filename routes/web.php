<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Home', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/buy', function () {
    return Inertia::render('Buy', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('buy');

Route::get('/rent', function () {
    return Inertia::render('Rent', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('rent');

Route::get('/rent/reserve/{id}', function ($id) {
    return Inertia::render('Rent/RentReservation', [
        'id' => $id,
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('rent.reserve');

Route::post('/rent/reserve', [\App\Http\Controllers\ReservationController::class, 'store'])->name('rent.reserve.store');

Route::get('/vehicles/{id}', function ($id) {
    return Inertia::render('VehicleDetail', [
        'id' => $id,
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('vehicles.show');

Route::get('/contact', function () {
    return Inertia::render('Contact', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('contact');

Route::post('/contact', [\App\Http\Controllers\ContactController::class, 'submit'])->name('contact.submit');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/admin/cars', function () {
        return Inertia::render('Admin/Cars/Index');
    })->name('admin.cars.index');

    Route::get('/admin/rent-cars', function () {
        return Inertia::render('Admin/RentCars/Index');
    })->name('admin.rent.index');

    Route::get('/admin/rent-reservations', function () {
        return Inertia::render('Admin/Reservations/Index');
    })->name('admin.reservations.index');

    Route::get('/admin/cars/create', function () {
        return Inertia::render('Admin/Cars/Create');
    })->name('admin.cars.create');

    Route::get('/admin/cars/{id}/edit', function ($id) {
        return Inertia::render('Admin/Cars/Edit', [
            'id' => $id,
        ]);
    })->name('admin.cars.edit');

    Route::get('/admin/cars/{id}', function ($id) {
        return Inertia::render('Admin/Cars/Show', [
            'id' => $id,
        ]);
    })->name('admin.cars.show');

    Route::post('/admin/cars', [\App\Http\Controllers\AdminVehicleController::class, 'store'])->name('admin.cars.store');
    Route::delete('/admin/cars/{id}', [\App\Http\Controllers\AdminVehicleController::class, 'destroy'])->name('admin.cars.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
