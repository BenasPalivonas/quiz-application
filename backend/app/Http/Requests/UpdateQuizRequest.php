<?php

namespace App\Http\Requests;

class UpdateQuizRequest extends StoreQuizRequest
{
    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $rules = parent::rules();
        $rules['questions'] = ['sometimes', 'array', 'min:1'];

        return $rules;
    }
}
