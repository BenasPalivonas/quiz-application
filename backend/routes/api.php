<?php

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\QuizAttemptController;
use App\Http\Controllers\QuizController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'me']);

    Route::apiResource('quizzes', QuizController::class);

    Route::post('/quizzes/{quiz}/attempts', [QuizAttemptController::class, 'store']);
    Route::get('/attempts/{attempt}', [QuizAttemptController::class, 'show']);
    Route::post('/attempts/{attempt}/answers', [QuizAttemptController::class, 'storeAnswer']);
    Route::post('/attempts/{attempt}/complete', [QuizAttemptController::class, 'complete']);
});
