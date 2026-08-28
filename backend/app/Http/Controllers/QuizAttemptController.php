<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreAttemptAnswerRequest;
use App\Http\Resources\QuizAttemptResource;
use App\Models\Choice;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\AiFeedbackService;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class QuizAttemptController extends Controller
{
    public function index(Request $request)
    {
        $attempts = $request->user()->quizAttempts()
            ->with(['quiz' => fn ($query) => $query->withCount('questions')])
            ->withCount('answers')
            ->orderByDesc('id')
            ->paginate(10);

        return QuizAttemptResource::collection($attempts);
    }

    public function store(Request $request, Quiz $quiz)
    {
        $attempt = $quiz->attempts()->create([
            'user_id' => $request->user()->id,
            'started_at' => now(),
        ]);

        return new QuizAttemptResource($attempt);
    }

    public function storeAnswer(StoreAttemptAnswerRequest $request, QuizAttempt $attempt)
    {
        $this->authorizeAttempt($request, $attempt);

        $choice = Choice::where('id', $request->validated('choice_id'))
            ->where('question_id', $request->validated('question_id'))
            ->first();

        if (! $choice) {
            throw ValidationException::withMessages([
                'choice_id' => ['The choice does not belong to the given question.'],
            ]);
        }

        $answer = $attempt->answers()->updateOrCreate(
            ['question_id' => $request->validated('question_id')],
            [
                'choice_id' => $request->validated('choice_id'),
                'time_spent_ms' => $request->validated('time_spent_ms'),
            ]
        );

        return response()->json($answer);
    }

    public function complete(Request $request, QuizAttempt $attempt, AiFeedbackService $aiFeedbackService)
    {
        $this->authorizeAttempt($request, $attempt);

        $attempt->update(['completed_at' => now()]);
        $attempt->load('answers.choice', 'quiz.questions.choices');

        $attempt->update([
            'ai_feedback' => $aiFeedbackService->generate($attempt),
        ]);

        return new QuizAttemptResource($attempt);
    }

    public function show(Request $request, QuizAttempt $attempt)
    {
        $this->authorizeAttempt($request, $attempt);

        $attempt->load('answers.choice', 'quiz');

        return new QuizAttemptResource($attempt);
    }

    private function authorizeAttempt(Request $request, QuizAttempt $attempt): void
    {
        abort_unless($attempt->user_id === $request->user()->id, 403);
    }
}
