<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreQuizRequest;
use App\Http\Requests\UpdateQuizRequest;
use App\Http\Resources\QuizResource;
use App\Models\Quiz;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class QuizController extends Controller
{
    public function index(Request $request)
    {
        $quizzes = Quiz::withCount('questions')
            ->orderByDesc('id')
            ->paginate(15);

        return QuizResource::collection($quizzes);
    }

    public function show(Request $request, Quiz $quiz)
    {
        $quiz->load('questions.choices');

        return new QuizResource($quiz);
    }

    public function store(StoreQuizRequest $request)
    {
        $quiz = DB::transaction(function () use ($request) {
            $quiz = $request->user()->quizzes()->create([
                'title' => $request->validated('title'),
            ]);

            $this->syncQuestions($quiz, $request->validated('questions'));

            return $quiz;
        });

        $quiz->load('questions.choices');

        return new QuizResource($quiz);
    }

    public function update(UpdateQuizRequest $request, Quiz $quiz)
    {
        $this->authorize('update', $quiz);

        DB::transaction(function () use ($request, $quiz) {
            $quiz->update(array_filter([
                'title' => $request->validated('title'),
            ], fn ($value) => $value !== null));

            if ($request->has('questions')) {
                $quiz->questions()->delete();
                $this->syncQuestions($quiz, $request->validated('questions'));
            }
        });

        $quiz->load('questions.choices');

        return new QuizResource($quiz);
    }

    public function destroy(Request $request, Quiz $quiz)
    {
        $this->authorize('delete', $quiz);

        $quiz->delete();

        return response()->noContent();
    }

    private function syncQuestions(Quiz $quiz, array $questions): void
    {
        foreach ($questions as $questionData) {
            $question = $quiz->questions()->create([
                'text' => $questionData['text'],
            ]);

            foreach ($questionData['choices'] as $choiceData) {
                $question->choices()->create([
                    'text' => $choiceData['text'],
                ]);
            }
        }
    }
}
