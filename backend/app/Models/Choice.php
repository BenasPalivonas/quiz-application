<?php

namespace App\Models;

use Database\Factories\ChoiceFactory;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

#[Fillable(['text', 'order'])]
class Choice extends Model
{
    /** @use HasFactory<ChoiceFactory> */
    use HasFactory;

    public function question(): BelongsTo
    {
        return $this->belongsTo(Question::class);
    }
}
