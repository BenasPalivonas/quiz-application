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

    public function test_index_can_be_filtered_to_the_authenticated_users_own_quizzes(): void
    {
        $user = User::factory()->create();
        $other = User::factory()->create();

        $user->quizzes()->create(['title' => 'Mine']);
        $other->quizzes()->create(['title' => 'Not mine']);

        $response = $this->actingAs($user)->getJson('/api/quizzes?mine=1');

        $response->assertOk()
            ->assertJsonCount(1, 'data')
            ->assertJsonPath('data.0.title', 'Mine');
    }

    public function test_index_is_paginated(): void
    {
        $user = User::factory()->create();
        $user->quizzes()->createMany(
            collect(range(1, 20))->map(fn ($i) => ['title' => "Quiz {$i}"])->all()
        );

        $response = $this->actingAs($user)->getJson('/api/quizzes?mine=1');

        $response->assertOk()
            ->assertJsonCount(15, 'data')
            ->assertJsonPath('meta.total', 20)
            ->assertJsonPath('meta.last_page', 2);

        $this->actingAs($user)->getJson('/api/quizzes?mine=1&page=2')
            ->assertOk()
            ->assertJsonCount(5, 'data');
    }

    public function test_only_the_owner_can_update_their_quiz(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $quiz = $owner->quizzes()->create(['title' => 'Original']);

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
        $quiz = $owner->quizzes()->create(['title' => 'Original']);

        $this->actingAs($other)->deleteJson("/api/quizzes/{$quiz->id}")->assertForbidden();
        $this->actingAs($owner)->deleteJson("/api/quizzes/{$quiz->id}")->assertNoContent();

        $this->assertDatabaseMissing('quizzes', ['id' => $quiz->id]);
    }
}
