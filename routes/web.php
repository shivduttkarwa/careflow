<?php

use App\Http\Controllers\AnnouncementController;
use App\Http\Controllers\DailyReportController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\PatientController;
use App\Http\Controllers\SeizureEventController;
use App\Http\Controllers\TeamController;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/login')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('dashboard', DashboardController::class)->name('dashboard');

    Route::get('patients', [PatientController::class, 'index'])->name('patients.index');
    Route::get('patients/create', [PatientController::class, 'create'])->name('patients.create');
    Route::post('patients', [PatientController::class, 'store'])->name('patients.store');
    Route::get('patients/{patient}', [PatientController::class, 'show'])->name('patients.show');
    Route::get('reports', [DailyReportController::class, 'index'])->name('reports.index');
    Route::get('reports/create', [DailyReportController::class, 'create'])->name('reports.create');
    Route::get('reports/export', [DailyReportController::class, 'export'])->name('reports.export');
    Route::get('reports/book', [DailyReportController::class, 'book'])->name('reports.book');
    Route::post('reports', [DailyReportController::class, 'store'])->name('reports.store');
    Route::get('reports/{report}', [DailyReportController::class, 'show'])->name('reports.show');
    Route::get('reports/{report}/edit', [DailyReportController::class, 'edit'])->name('reports.edit');
    Route::patch('reports/{report}', [DailyReportController::class, 'update'])->name('reports.update');
    Route::get('reports/{report}/print', [DailyReportController::class, 'print'])->name('reports.print');

    Route::get('seizures/create', [SeizureEventController::class, 'create'])->name('seizures.create');
    Route::post('seizures', [SeizureEventController::class, 'store'])->name('seizures.store');

    Route::post('announcements/{announcement}/acknowledge', [AnnouncementController::class, 'acknowledge'])
        ->name('announcements.acknowledge');

    Route::get('team', [TeamController::class, 'index'])->name('team.index');
    Route::post('team', [TeamController::class, 'store'])->name('team.store');
    Route::put('team/{member}/assignments', [TeamController::class, 'updateAssignments'])->name('team.assignments');
});

require __DIR__.'/settings.php';
