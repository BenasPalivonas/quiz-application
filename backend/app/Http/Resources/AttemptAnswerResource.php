<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AttemptAnswerResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'question_id' => $this->question_id,
            'question_text' => $this->question->text,
            'choice_id' => $this->choice_id,
            'choice_text' => $this->choice->text,
            'time_spent_ms' => $this->time_spent_ms,
        ];
    }
}
