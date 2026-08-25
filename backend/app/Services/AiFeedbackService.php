<?php

namespace App\Services;

use App\Models\QuizAttempt;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiFeedbackService
{
    public const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1/interactions';

    private const CACHE_TTL_ONE_WEEK = 60 * 60 * 24 * 7;

    /**
     * Generate a personalized "quiz result" for a completed personality quiz attempt.
     *
     * Requires GEMINI_API_KEY to be set.
     *
     * Results are cached per quiz + choice combination for a week,
     * since the prompt is a pure function of which choices were picked,
     * so identical answers would otherwise burn tokens
     * regenerating results from the same prompt.
     */
    public function generate(QuizAttempt $attempt): ?string
    {
        $apiKey = config('services.gemini.key');
        if (! $apiKey) {
            return null;
        }

        $cacheKey = $this->cacheKey($attempt);

        if (! is_null($cached = Cache::get($cacheKey))) {
            return $cached;
        }

        $feedback = $this->requestAiFeedback($attempt, $apiKey);

        if (! is_null($feedback)) {
            Cache::put($cacheKey, $feedback, self::CACHE_TTL_ONE_WEEK);
        }

        return $feedback;
    }

    private function requestAiFeedback(QuizAttempt $attempt, string $apiKey): ?string
    {
        $response = Http::withHeaders([
            'x-goog-api-key' => $apiKey,
        ])->post(self::GEMINI_API_URL, [
            'model' => config('services.gemini.model'),
            'input' => $this->buildPrompt($attempt),
        ]);

        if ($response->failed()) {
            Log::warning('AI feedback generation failed', [
                'status' => $response->status(),
                'message' => $response->json('error.message'),
            ]);

            return null;
        }

        return $this->extractText($response->json('steps', []));
    }

    private function extractText(array $steps): ?string
    {
        $modelOutput = collect($steps)->firstWhere('type', 'model_output');

        return collect($modelOutput['content'] ?? [])->firstWhere('type', 'text')['text'] ?? null;
    }

    /**
     * A cache key that depends only on the quiz and which choice was picked
     * for each question. Not the attempt id, user, or answer timing.
     */
    private function cacheKey(QuizAttempt $attempt): string
    {
        $answers = $attempt->answers
            ->sortBy('question_id')
            ->map(fn ($answer) => "{$answer->question_id}:{$answer->choice_id}")
            ->implode('|');

        return 'ai_feedback:'.$attempt->quiz_id.':'.hash('sha256', $answers);
    }

    private function buildPrompt(QuizAttempt $attempt): string
    {
        $lines = [];
        $lines[] = "This is a personality quiz called \"{$attempt->quiz->title}\".";

        $lines[] = 'A user just answered every question. Here is each question and what they picked:';

        foreach ($attempt->answers as $answer) {
            $lines[] = sprintf(
                '- "%s" — picked "%s"',
                $answer->question->text,
                $answer->choice->text
            );
        }

        $lines[] = <<<'PROMPT'
            Write their personalized quiz result. Give it a fun, specific title
            (e.g. "You are: The Curious Fox"), then 3-4 sentences describing them,
            grounded in the actual choices above — not generic praise. Look at what
            these specific answers suggest about their personality and commit to a
            take. Address them directly and keep the tone warm and fun, not clinical.
            PROMPT;

        return implode("\n", $lines);
    }
}
