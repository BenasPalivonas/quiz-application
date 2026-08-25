<?php

namespace Tests\Feature;

use App\Models\Quiz;
use App\Models\User;
use App\Services\AiFeedbackService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class QuizAttemptTest extends TestCase
{
    use RefreshDatabase;

    private function createQuiz(User $owner): Quiz
    {
        $quiz = $owner->quizzes()->create(['title' => 'Quiz']);
        $question = $quiz->questions()->create(['text' => 'Pick a vibe.']);
        $question->choices()->create(['text' => 'Chill']);
        $question->choices()->create(['text' => 'Chaotic']);

        return $quiz->load('questions.choices');
    }

    public function test_a_user_can_start_answer_and_complete_an_attempt_with_millisecond_timing(): void
    {
        $owner = User::factory()->create();
        $taker = User::factory()->create();
        $quiz = $this->createQuiz($owner);
        $question = $quiz->questions->first();
        $choice = $question->choices->last();

        $startResponse = $this->actingAs($taker)->postJson("/api/quizzes/{$quiz->id}/attempts");
        $startResponse->assertCreated();
        $attemptId = $startResponse->json('data.id');

        $answerResponse = $this->actingAs($taker)->postJson("/api/attempts/{$attemptId}/answers", [
            'question_id' => $question->id,
            'choice_id' => $choice->id,
            'time_spent_ms' => 4321,
        ]);
        $answerResponse->assertOk();

        $this->assertDatabaseHas('attempt_answers', [
            'quiz_attempt_id' => $attemptId,
            'question_id' => $question->id,
            'choice_id' => $choice->id,
            'time_spent_ms' => 4321,
        ]);

        $completeResponse = $this->actingAs($taker)->postJson("/api/attempts/{$attemptId}/complete");
        $completeResponse->assertOk()
            ->assertJsonPath('data.answers.0.time_spent_ms', 4321);

        $this->assertDatabaseHas('quiz_attempts', ['id' => $attemptId, 'user_id' => $taker->id]);
        $this->assertNotNull($completeResponse->json('data.completed_at'));
        // No GEMINI_API_KEY configured in tests, so the AI feedback step no-ops.
        $this->assertNull($completeResponse->json('data.ai_feedback'));
    }

    public function test_ai_feedback_is_generated_when_the_ai_call_succeeds(): void
    {
        config(['services.gemini.key' => 'test-key']);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'steps' => [
                    ['type' => 'model_output', 'content' => [['type' => 'text', 'text' => 'You are: The Curious Fox.']]],
                ],
            ], 200),
        ]);

        $owner = User::factory()->create();
        $taker = User::factory()->create();
        $quiz = $this->createQuiz($owner);
        $question = $quiz->questions->first();
        $choice = $question->choices->first();

        $attemptId = $this->actingAs($taker)
            ->postJson("/api/quizzes/{$quiz->id}/attempts")
            ->json('data.id');

        $this->actingAs($taker)->postJson("/api/attempts/{$attemptId}/answers", [
            'question_id' => $question->id,
            'choice_id' => $choice->id,
            'time_spent_ms' => 1000,
        ]);

        $response = $this->actingAs($taker)->postJson("/api/attempts/{$attemptId}/complete");

        $response->assertOk()->assertJsonPath('data.ai_feedback', 'You are: The Curious Fox.');

        Http::assertSent(fn ($request) => $request->url() === AiFeedbackService::GEMINI_API_URL);
    }

    public function test_ai_feedback_is_cached_for_identical_answers_across_attempts(): void
    {
        config(['services.gemini.key' => 'test-key']);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'steps' => [
                    ['type' => 'model_output', 'content' => [['type' => 'text', 'text' => 'You are: The Curious Fox.']]],
                ],
            ], 200),
        ]);

        $owner = User::factory()->create();
        $quiz = $this->createQuiz($owner);
        $question = $quiz->questions->first();
        $choice = $question->choices->first();

        $completeWithAnswer = function () use ($quiz, $question, $choice) {
            $taker = User::factory()->create();

            $attemptId = $this->actingAs($taker)
                ->postJson("/api/quizzes/{$quiz->id}/attempts")
                ->json('data.id');

            $this->actingAs($taker)->postJson("/api/attempts/{$attemptId}/answers", [
                'question_id' => $question->id,
                'choice_id' => $choice->id,
                'time_spent_ms' => rand(500, 5000),
            ]);

            return $this->actingAs($taker)->postJson("/api/attempts/{$attemptId}/complete");
        };

        $first = $completeWithAnswer();
        $second = $completeWithAnswer();

        $first->assertOk()->assertJsonPath('data.ai_feedback', 'You are: The Curious Fox.');
        $second->assertOk()->assertJsonPath('data.ai_feedback', 'You are: The Curious Fox.');

        // Same quiz + same choice picked twice
        // should only hit the AI API once, the second attempt is served from cache.
        Http::assertSentCount(1);
    }

    public function test_ai_feedback_is_not_cached_across_different_answers(): void
    {
        config(['services.gemini.key' => 'test-key']);
        Http::fakeSequence()
            ->push(['steps' => [['type' => 'model_output', 'content' => [['type' => 'text', 'text' => 'You are: The Curious Fox.']]]]], 200)
            ->push(['steps' => [['type' => 'model_output', 'content' => [['type' => 'text', 'text' => 'You are: The Chaotic Goblin.']]]]], 200);

        $owner = User::factory()->create();
        $quiz = $this->createQuiz($owner);
        $question = $quiz->questions->first();

        $completeWithChoice = function ($choice) use ($quiz, $question) {
            $taker = User::factory()->create();

            $attemptId = $this->actingAs($taker)
                ->postJson("/api/quizzes/{$quiz->id}/attempts")
                ->json('data.id');

            $this->actingAs($taker)->postJson("/api/attempts/{$attemptId}/answers", [
                'question_id' => $question->id,
                'choice_id' => $choice->id,
                'time_spent_ms' => 1000,
            ]);

            return $this->actingAs($taker)->postJson("/api/attempts/{$attemptId}/complete");
        };

        $chill = $completeWithChoice($question->choices->first());
        $chaotic = $completeWithChoice($question->choices->last());

        $chill->assertOk()->assertJsonPath('data.ai_feedback', 'You are: The Curious Fox.');
        $chaotic->assertOk()->assertJsonPath('data.ai_feedback', 'You are: The Chaotic Goblin.');

        Http::assertSentCount(2);
    }

    public function test_ai_feedback_is_null_when_the_ai_call_fails(): void
    {
        config(['services.gemini.key' => 'test-key']);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'error' => ['code' => 503, 'message' => 'This model is currently experiencing high demand.', 'status' => 'UNAVAILABLE'],
            ], 503),
        ]);

        $owner = User::factory()->create();
        $taker = User::factory()->create();
        $quiz = $this->createQuiz($owner);
        $question = $quiz->questions->first();
        $choice = $question->choices->first();

        $attemptId = $this->actingAs($taker)
            ->postJson("/api/quizzes/{$quiz->id}/attempts")
            ->json('data.id');

        $this->actingAs($taker)->postJson("/api/attempts/{$attemptId}/answers", [
            'question_id' => $question->id,
            'choice_id' => $choice->id,
            'time_spent_ms' => 1000,
        ]);

        $response = $this->actingAs($taker)->postJson("/api/attempts/{$attemptId}/complete");

        $response->assertOk()->assertJsonPath('data.ai_feedback', null);
    }

    public function test_a_user_cannot_answer_another_users_attempt(): void
    {
        $owner = User::factory()->create();
        $taker = User::factory()->create();
        $intruder = User::factory()->create();
        $quiz = $this->createQuiz($owner);
        $question = $quiz->questions->first();
        $choice = $question->choices->first();

        $attemptId = $this->actingAs($taker)
            ->postJson("/api/quizzes/{$quiz->id}/attempts")
            ->json('data.id');

        $this->actingAs($intruder)->postJson("/api/attempts/{$attemptId}/answers", [
            'question_id' => $question->id,
            'choice_id' => $choice->id,
            'time_spent_ms' => 100,
        ])->assertForbidden();
    }

    public function test_a_choice_must_belong_to_the_given_question(): void
    {
        $owner = User::factory()->create();
        $taker = User::factory()->create();
        $quiz = $this->createQuiz($owner);
        $otherQuiz = $this->createQuiz($owner);

        $attemptId = $this->actingAs($taker)
            ->postJson("/api/quizzes/{$quiz->id}/attempts")
            ->json('data.id');

        $this->actingAs($taker)->postJson("/api/attempts/{$attemptId}/answers", [
            'question_id' => $quiz->questions->first()->id,
            'choice_id' => $otherQuiz->questions->first()->choices->first()->id,
            'time_spent_ms' => 100,
        ])->assertUnprocessable();
    }
}
