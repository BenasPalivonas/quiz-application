<?php

namespace Database\Factories;

use App\Models\AttemptAnswer;
use App\Models\Choice;
use App\Models\Question;
use App\Models\QuizAttempt;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AttemptAnswer>
 */
class AttemptAnswerFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'quiz_attempt_id' => QuizAttempt::factory(),
            'question_id' => Question::factory(),
            'choice_id' => Choice::factory(),
            'time_spent_ms' => fake()->numberBetween(500, 15000),
        ];
    }
}
