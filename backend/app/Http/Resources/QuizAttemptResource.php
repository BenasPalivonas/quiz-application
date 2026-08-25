<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizAttemptResource extends JsonResource
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
            'quiz_id' => $this->quiz_id,
            'quiz_title' => $this->whenLoaded('quiz', fn () => $this->quiz->title),
            'started_at' => $this->started_at,
            'completed_at' => $this->completed_at,
            'ai_feedback' => $this->ai_feedback,
            'answers' => AttemptAnswerResource::collection($this->whenLoaded('answers')),
        ];
    }
}
