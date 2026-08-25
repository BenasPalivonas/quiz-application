<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class QuizSeeder extends Seeder
{
    /**
     * Seed a sample personality quiz owned by the given user (or the first user).
     */
    public function run(): void
    {
        $owner = User::first() ?? User::factory()->create();

        $quiz = $owner->quizzes()->create([
            'title' => 'What Animal Are You?',
            'description' => 'Answer honestly and find out which animal matches your personality.',
        ]);

        $questions = [
            [
                'text' => 'It\'s a free Saturday with no plans. What do you do?',
                'choices' => [
                    ['text' => 'Round up friends for something spontaneous'],
                    ['text' => 'Curl up with a book and total quiet'],
                    ['text' => 'Go explore somewhere I\'ve never been'],
                    ['text' => 'Catch up on chores so tomorrow is easier'],
                ],
            ],
            [
                'text' => 'A big decision is in front of you. How do you approach it?',
                'choices' => [
                    ['text' => 'Trust my gut and decide quickly'],
                    ['text' => 'Talk it through with people I trust'],
                    ['text' => 'Research every angle before committing'],
                    ['text' => 'Sit with it alone until it feels right'],
                ],
            ],
            [
                'text' => 'How would your friends describe you?',
                'choices' => [
                    ['text' => 'The dependable one who always follows through'],
                    ['text' => 'The life of the party'],
                    ['text' => 'Calm, private, and hard to rattle'],
                    ['text' => 'Always chasing the next big thing'],
                ],
            ],
            [
                'text' => 'Pick a vacation.',
                'choices' => [
                    ['text' => 'A backpacking trip with no fixed itinerary'],
                    ['text' => 'A cabin in the woods, alone'],
                    ['text' => 'A big group trip with friends'],
                    ['text' => 'A well-planned tour with a detailed schedule'],
                ],
            ],
            [
                'text' => 'What stresses you out the most?',
                'choices' => [
                    ['text' => 'Being micromanaged'],
                    ['text' => 'Sitting still with nothing new happening'],
                    ['text' => 'Being left out of the plan'],
                    ['text' => 'Loose ends and unfinished tasks'],
                ],
            ],
        ];

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
