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

Route::get('/repair', function () {
    return Inertia::render('Repair', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('repair');

Route::get('/rent/reserve/{id}', function ($id) {
    return Inertia::render('Rent/RentReservation', [
        'id' => $id,
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('rent.reserve');

Route::post('/rent/reserve', [\App\Http\Controllers\ReservationController::class, 'store'])->name('rent.reserve.store');
Route::post('/repair/estimate', [\App\Http\Controllers\EstimateController::class, 'store'])->name('repair.estimate.store');
Route::post('/rent/reservations/send-approval-email', [\App\Http\Controllers\ReservationController::class, 'sendApprovalEmail'])->name('rent.reserve.sendApprovalEmail');
Route::post('/rent/reservations/send-alternative-offer-email', [\App\Http\Controllers\ReservationController::class, 'sendAlternativeOfferEmail'])->name('rent.reserve.sendAlternativeOfferEmail');
Route::post('/rent/reservations/send-cancellation-email', [\App\Http\Controllers\ReservationController::class, 'sendCancellationEmail'])->name('rent.reserve.sendCancellationEmail');
Route::post('/rent/reservations/send-completed-email', [\App\Http\Controllers\ReservationController::class, 'sendCompletedEmail'])->name('rent.reserve.sendCompletedEmail');
Route::post('/rent/reservations/send-payment-email', [\App\Http\Controllers\ReservationController::class, 'sendPaymentEmail'])->name('rent.reserve.sendPaymentEmail');
Route::post('/rent/reservations/send-extended-email', [\App\Http\Controllers\ReservationController::class, 'sendExtendedEmail'])->name('rent.reserve.sendExtendedEmail');
Route::get('/rent/reservations/{confirmationNumber}/accept-alternative', [\App\Http\Controllers\ReservationController::class, 'acceptAlternative'])->name('rent.reserve.acceptAlternative');
Route::get('/rent/reservations/{confirmationNumber}/cancel', [\App\Http\Controllers\ReservationController::class, 'cancel'])->name('rent.reserve.cancel');

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

Route::get('/privacy-policy', function () {
    return Inertia::render('PrivacyPolicy', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('privacy-policy');

Route::get('/terms-of-service', function () {
    return Inertia::render('TermsOfService', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('terms-of-service');

Route::get('/cookie-settings', function () {
    return Inertia::render('CookieSettings', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
    ]);
})->name('cookie-settings');

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

    Route::get('/admin/rent-reservations/{confirmationNumber}/edit', function ($confirmationNumber) {
        return Inertia::render('Admin/Reservations/Edit', [
            'confirmationNumber' => $confirmationNumber,
        ]);
    })->name('admin.reservations.edit');

    Route::get('/admin/rent-reservations/{confirmationNumber}', function ($confirmationNumber) {
        return Inertia::render('Admin/Reservations/Show', [
            'confirmationNumber' => $confirmationNumber,
        ]);
    })->name('admin.reservations.show');

    Route::get('/admin/services', function () {
        return Inertia::render('Admin/Services/Index');
    })->name('admin.services.index');

    Route::get('/admin/services/create', function () {
        return Inertia::render('Admin/Services/Create');
    })->name('admin.services.create');

    Route::get('/admin/services/{id}/edit', function ($id) {
        return Inertia::render('Admin/Services/Edit', [
            'id' => $id,
        ]);
    })->name('admin.services.edit');

    Route::get('/admin/categories/create', function () {
        return Inertia::render('Admin/Categories/Create');
    })->name('admin.categories.create');

    Route::get('/admin/categories/{id}/edit', function ($id) {
        return Inertia::render('Admin/Categories/Edit', [
            'id' => $id,
        ]);
    })->name('admin.categories.edit');

    Route::get('/admin/coupons', function () {
        return Inertia::render('Admin/Coupons/Index');
    })->name('admin.coupons.index');

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

    Route::post('/admin/categories', [\App\Http\Controllers\AdminVehicleController::class, 'saveCategory'])->name('admin.categories.store');
    Route::delete('/admin/categories/{id?}', [\App\Http\Controllers\AdminVehicleController::class, 'deleteCategory'])->name('admin.categories.destroy');

    Route::post('/admin/services', [\App\Http\Controllers\AdminVehicleController::class, 'saveService'])->name('admin.services.store');
    Route::delete('/admin/services/{id?}', [\App\Http\Controllers\AdminVehicleController::class, 'deleteService'])->name('admin.services.destroy');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__ . '/auth.php';
