<?php

namespace App\Models;

use Database\Factories\AttemptAnswerFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['question_id', 'choice_id', 'time_spent_ms'])]
class AttemptAnswer extends Model
{
    /** @use HasFactory<AttemptAnswerFactory> */
    use HasFactory;

    protected function casts(): array
    {
        return [
            'time_spent_ms' => 'integer',
        ];
    }

    public function quizAttempt(): BelongsTo
    {
        return $this->belongsTo(QuizAttempt::class);
    }

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }

    public function choice(): BelongsTo
    {
        return $this->belongsTo(Choice::class);
    }
}
