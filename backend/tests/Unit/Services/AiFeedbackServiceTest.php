<?php

namespace Tests\Unit\Services;

use App\Models\AttemptAnswer;
use App\Models\Choice;
use App\Models\Question;
use App\Models\Quiz;
use App\Models\QuizAttempt;
use App\Services\AiFeedbackService;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\Http;
use Tests\TestCase;

class AiFeedbackServiceTest extends TestCase
{
    private function makeAttempt(int $quizId = 1, int $questionId = 1, int $choiceId = 1): QuizAttempt
    {
        $quiz = new Quiz();
        $quiz->id = $quizId;
        $quiz->title = 'Vibe Check';

        $question = new Question();
        $question->id = $questionId;
        $question->text = 'Pick a vibe.';

        $choice = new Choice();
        $choice->id = $choiceId;
        $choice->text = 'Chaotic';

        $answer = new AttemptAnswer();
        $answer->question_id = $questionId;
        $answer->choice_id = $choiceId;
        $answer->setRelation('question', $question);
        $answer->setRelation('choice', $choice);

        $attempt = new QuizAttempt();
        $attempt->quiz_id = $quizId;
        $attempt->setRelation('quiz', $quiz);
        $attempt->setRelation('answers', new Collection([$answer]));

        return $attempt;
    }

    public function test_returns_null_without_a_configured_api_key(): void
    {
        config(['services.gemini.key' => null]);
        Http::fake();

        $result = (new AiFeedbackService())->generate($this->makeAttempt());

        $this->assertNull($result);
        Http::assertNothingSent();
    }

    public function test_returns_the_generated_text_on_success(): void
    {
        config(['services.gemini.key' => 'test-key']);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'steps' => [
                    ['type' => 'model_output', 'content' => [['type' => 'text', 'text' => 'You are: The Chaotic Goblin.']]],
                ],
            ], 200),
        ]);

        $result = (new AiFeedbackService())->generate($this->makeAttempt());

        $this->assertSame('You are: The Chaotic Goblin.', $result);
    }

    public function test_returns_null_when_the_api_call_fails(): void
    {
        config(['services.gemini.key' => 'test-key']);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'error' => ['message' => 'This model is currently experiencing high demand.'],
            ], 503),
        ]);

        $result = (new AiFeedbackService())->generate($this->makeAttempt());

        $this->assertNull($result);
    }

    public function test_caches_the_result_per_quiz_and_choice_combination(): void
    {
        config(['services.gemini.key' => 'test-key']);
        Http::fake([
            'generativelanguage.googleapis.com/*' => Http::response([
                'steps' => [
                    ['type' => 'model_output', 'content' => [['type' => 'text', 'text' => 'You are: The Chaotic Goblin.']]],
                ],
            ], 200),
        ]);

        $service = new AiFeedbackService();
        $first = $service->generate($this->makeAttempt());
        $second = $service->generate($this->makeAttempt());

        $this->assertSame('You are: The Chaotic Goblin.', $first);
        $this->assertSame($first, $second);
        Http::assertSentCount(1);
    }

    public function test_a_failed_response_is_not_cached(): void
    {
        config(['services.gemini.key' => 'test-key']);
        Http::fakeSequence()
            ->push(['error' => ['message' => 'nope']], 503)
            ->push([
                'steps' => [
                    ['type' => 'model_output', 'content' => [['type' => 'text', 'text' => 'You are: The Chaotic Goblin.']]],
                ],
            ], 200);

        $service = new AiFeedbackService();
        $first = $service->generate($this->makeAttempt());
        $second = $service->generate($this->makeAttempt());

        $this->assertNull($first);
        $this->assertSame('You are: The Chaotic Goblin.', $second);
        Http::assertSentCount(2);
    }

    public function test_different_choices_are_cached_separately(): void
    {
        config(['services.gemini.key' => 'test-key']);
        Http::fakeSequence()
            ->push(['steps' => [['type' => 'model_output', 'content' => [['type' => 'text', 'text' => 'You are: The Curious Fox.']]]]], 200)
            ->push(['steps' => [['type' => 'model_output', 'content' => [['type' => 'text', 'text' => 'You are: The Chaotic Goblin.']]]]], 200);

        $service = new AiFeedbackService();
        $chill = $service->generate($this->makeAttempt(choiceId: 1));
        $chaotic = $service->generate($this->makeAttempt(choiceId: 2));

        $this->assertSame('You are: The Curious Fox.', $chill);
        $this->assertSame('You are: The Chaotic Goblin.', $chaotic);
        Http::assertSentCount(2);
    }
}
