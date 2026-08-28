"use client";

import { Button } from "@repo/ui/button";
import { Input } from "@repo/ui/input";
import type { ReactElement } from "react";
import { MAX_CHOICES, MIN_CHOICES } from "../question-consts";
import { useQuestionsStore } from "../stores/questions-store";
import type { QuestionInput } from "../types";

type QuestionEditorFormProps = {
  question: QuestionInput;
  questionIndex: number;
  fieldErrors: Record<string, string[]>;
};

export function QuestionEditorForm({
  question,
  questionIndex,
  fieldErrors,
}: QuestionEditorFormProps): ReactElement {
  const canRemoveQuestion = useQuestionsStore(
    (state) => state.questions.length > 1,
  );
  const updateQuestionText = useQuestionsStore(
    (state) => state.updateQuestionText,
  );
  const removeQuestion = useQuestionsStore((state) => state.removeQuestion);
  const updateChoiceText = useQuestionsStore((state) => state.updateChoiceText);
  const addChoice = useQuestionsStore((state) => state.addChoice);
  const removeChoice = useQuestionsStore((state) => state.removeChoice);

  return (
    <div className="flex flex-col gap-3 rounded-md border border-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1">
          <Input
            id={`question-${questionIndex}`}
            label={`Question ${questionIndex + 1}`}
            placeholder="Ask a question"
            required
            value={question.text}
            onChange={(e) => updateQuestionText(questionIndex, e.target.value)}
            errors={fieldErrors[`questions.${questionIndex}.text`]}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="mt-6"
          onClick={() => removeQuestion(questionIndex)}
          disabled={!canRemoveQuestion}
        >
          Remove question
        </Button>
      </div>

      <div className="flex flex-col gap-2 pl-4">
        {question.choices.map((choice, choiceIndex) => (
          <div key={choiceIndex} className="flex items-start gap-2">
            <div className="flex-1">
              <Input
                id={`question-${questionIndex}-choice-${choiceIndex}`}
                label={`Choice ${choiceIndex + 1}`}
                placeholder="Choice text"
                required
                value={choice.text}
                onChange={(e) =>
                  updateChoiceText(questionIndex, choiceIndex, e.target.value)
                }
                errors={
                  fieldErrors[
                    `questions.${questionIndex}.choices.${choiceIndex}.text`
                  ]
                }
              />
            </div>
            <Button
              type="button"
              variant="secondary"
              className="mt-6"
              onClick={() => removeChoice(questionIndex, choiceIndex)}
              disabled={question.choices.length <= MIN_CHOICES}
            >
              Remove choice
            </Button>
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          onClick={() => addChoice(questionIndex)}
          disabled={question.choices.length >= MAX_CHOICES}
        >
          Add choice
        </Button>
      </div>
    </div>
  );
}
