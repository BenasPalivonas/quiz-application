<?php

namespace Tests\Unit\Policies;

use App\Models\Quiz;
use App\Models\User;
use App\Policies\QuizPolicy;
use Tests\TestCase;

class QuizPolicyTest extends TestCase
{
    private QuizPolicy $policy;

    protected function setUp(): void
    {
        parent::setUp();

        $this->policy = new QuizPolicy;
    }

    private function userWithId(int $id): User
    {
        $user = new User;
        $user->id = $id;

        return $user;
    }

    private function quizOwnedBy(int $userId): Quiz
    {
        $quiz = new Quiz;
        $quiz->user_id = $userId;

        return $quiz;
    }

    public function test_owner_can_update_their_quiz(): void
    {
        $owner = $this->userWithId(1);
        $quiz = $this->quizOwnedBy(1);

        $this->assertTrue($this->policy->update($owner, $quiz));
    }

    public function test_non_owner_cannot_update_the_quiz(): void
    {
        $intruder = $this->userWithId(2);
        $quiz = $this->quizOwnedBy(1);

        $this->assertFalse($this->policy->update($intruder, $quiz));
    }

    public function test_owner_can_delete_their_quiz(): void
    {
        $owner = $this->userWithId(1);
        $quiz = $this->quizOwnedBy(1);

        $this->assertTrue($this->policy->delete($owner, $quiz));
    }

    public function test_non_owner_cannot_delete_the_quiz(): void
    {
        $intruder = $this->userWithId(2);
        $quiz = $this->quizOwnedBy(1);

        $this->assertFalse($this->policy->delete($intruder, $quiz));
    }
}
