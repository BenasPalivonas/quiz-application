<?php

namespace App\Policies;

use App\Models\Quiz;
use App\Models\User;

class QuizPolicy
{
    /**
     * Determine whether the user can update the model.
     */
    public function update(User $user, Quiz $quiz): bool
    {
        return $user->id === $quiz->user_id;
    }

    /**
     * Determine whether the user can delete the model.
     */
    public function delete(User $user, Quiz $quiz): bool
    {
        return $user->id === $quiz->user_id;
    }
}
