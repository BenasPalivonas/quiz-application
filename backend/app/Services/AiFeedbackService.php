<?php

namespace App\Services;

use App\Models\QuizAttempt;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class AiFeedbackService
{
    /**
     * Generate a personalized "quiz result" for a completed personality quiz attempt.
     *
     * Requires ANTHROPIC_API_KEY to be set; returns null (feature silently
     * disabled) when no key is configured so completing a quiz never fails
     * because of this bonus step.
     */
    public function generate(QuizAttempt $attempt): ?string
    {
        $apiKey = config('services.anthropic.key');

        if (! $apiKey) {
            return null;
        }

        $response = Http::withHeaders([
            'x-api-key' => $apiKey,
            'anthropic-version' => '2023-06-01',
        ])->post('https://api.anthropic.com/v1/messages', [
            'model' => config('services.anthropic.model'),
            'max_tokens' => 400,
            'messages' => [
                ['role' => 'user', 'content' => $this->buildPrompt($attempt)],
            ],
        ]);

        if ($response->failed()) {
            Log::warning('AI feedback generation failed', ['status' => $response->status()]);

            return null;
        }

        return $response->json('content.0.text');
    }

    private function buildPrompt(QuizAttempt $attempt): string
    {
        $lines = [];
        $lines[] = "This is a personality quiz called \"{$attempt->quiz->title}\".";

        if ($attempt->quiz->description) {
            $lines[] = "Description: {$attempt->quiz->description}";
        }

        $lines[] = 'A user just answered every question. Here is each question, what they picked, and how long they took to decide:';

        foreach ($attempt->answers as $answer) {
            $seconds = round($answer->time_spent_ms / 1000, 1);

            $lines[] = sprintf(
                '- "%s" — picked "%s", took %ss to decide',
                $answer->question->text,
                $answer->choice->text,
                $seconds
            );
        }

        $lines[] = <<<'PROMPT'
Write their personalized quiz result. Give it a fun, specific title (e.g. "You are: The Curious Fox"), then 3-4 sentences describing them, grounded in the actual choices above — not generic praise. Look at what these specific answers suggest about their personality and commit to a take. You may playfully reference how quickly or slowly they answered (impulsive vs. deliberate) if it fits. Address them directly and keep the tone warm and fun, not clinical.
PROMPT;

        return implode("\n", $lines);
    }
}
