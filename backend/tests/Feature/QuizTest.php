<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class QuizTest extends TestCase
{
    use RefreshDatabase;

    private function samplePayload(): array
    {
        return [
            'title' => 'Sample Quiz',
            'description' => 'A quiz for testing.',
            'questions' => [
                [
                    'text' => 'Pick a vibe.',
                    'choices' => [
                        ['text' => 'Chill'],
                        ['text' => 'Chaotic'],
                    ],
                ],
            ],
        ];
    }

    public function test_authenticated_user_can_create_a_quiz(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->postJson('/api/quizzes', $this->samplePayload());

        $response->assertCreated()
            ->assertJsonPath('data.title', 'Sample Quiz')
            ->assertJsonCount(1, 'data.questions')
            ->assertJsonCount(2, 'data.questions.0.choices');

        $this->assertDatabaseHas('quizzes', ['title' => 'Sample Quiz', 'user_id' => $user->id]);
        $this->assertDatabaseHas('choices', ['text' => 'Chaotic']);
    }

    public function test_only_the_owner_can_update_their_quiz(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $quiz = $owner->quizzes()->create(['title' => 'Original', 'description' => null]);

        $response = $this->actingAs($other)->putJson("/api/quizzes/{$quiz->id}", [
            'title' => 'Hacked',
        ]);

        $response->assertForbidden();
        $this->assertDatabaseHas('quizzes', ['id' => $quiz->id, 'title' => 'Original']);
    }

    public function test_only_the_owner_can_delete_their_quiz(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $quiz = $owner->quizzes()->create(['title' => 'Original', 'description' => null]);

        $this->actingAs($other)->deleteJson("/api/quizzes/{$quiz->id}")->assertForbidden();
        $this->actingAs($owner)->deleteJson("/api/quizzes/{$quiz->id}")->assertNoContent();

        $this->assertDatabaseMissing('quizzes', ['id' => $quiz->id]);
    }
}
