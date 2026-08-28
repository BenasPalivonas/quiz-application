<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class QuizResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $isOwner = $request->user()?->id === $this->user_id;

        return [
            'id' => $this->id,
            'title' => $this->title,
            'user_id' => $this->user_id,
            'is_owner' => $isOwner,
            'user_name' => $this->whenLoaded('user', fn () => $this->user->name),
            'questions_count' => $this->whenCounted('questions'),
            'questions' => $this->whenLoaded('questions', fn () => $this->questions->map(
                fn ($question) => [
                    'id' => $question->id,
                    'text' => $question->text,
                    'choices' => $question->choices->map(fn ($choice) => [
                        'id' => $choice->id,
                        'text' => $choice->text,
                    ]),
                ]
            )),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
