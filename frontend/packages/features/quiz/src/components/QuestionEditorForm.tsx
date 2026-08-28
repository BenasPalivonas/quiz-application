"use client";

import { Button } from "@repo/ui/button";
import { ErrorText } from "@repo/ui/error-text";
import { Input } from "@repo/ui/input";
import type { ReactElement } from "react";
import { MAX_CHOICES, MIN_CHOICES } from "../question-consts";
import type { QuestionInput } from "../types";

type QuestionEditorFormProps = {
  question: QuestionInput;
  questionIndex: number;
  canRemoveQuestion: boolean;
  fieldErrors: Record<string, string[]>;
  onUpdateQuestionText: (questionIndex: number, text: string) => void;
  onRemoveQuestion: (questionIndex: number) => void;
  onUpdateChoiceText: (
    questionIndex: number,
    choiceIndex: number,
    text: string,
  ) => void;
  onAddChoice: (questionIndex: number) => void;
  onRemoveChoice: (questionIndex: number, choiceIndex: number) => void;
};

export function QuestionEditorForm({
  question,
  questionIndex,
  canRemoveQuestion,
  fieldErrors,
  onUpdateQuestionText,
  onRemoveQuestion,
  onUpdateChoiceText,
  onAddChoice,
  onRemoveChoice,
}: QuestionEditorFormProps): ReactElement {
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
            onChange={(e) =>
              onUpdateQuestionText(questionIndex, e.target.value)
            }
            errors={fieldErrors[`questions.${questionIndex}.text`]}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="mt-6"
          onClick={() => onRemoveQuestion(questionIndex)}
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
                  onUpdateChoiceText(questionIndex, choiceIndex, e.target.value)
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
              onClick={() => onRemoveChoice(questionIndex, choiceIndex)}
              disabled={question.choices.length <= MIN_CHOICES}
            >
              Remove choice
            </Button>
          </div>
        ))}

        {fieldErrors[`questions.${questionIndex}.choices`] && (
          <ErrorText>
            {fieldErrors[`questions.${questionIndex}.choices`]?.[0]}
          </ErrorText>
        )}

        <Button
          type="button"
          variant="secondary"
          onClick={() => onAddChoice(questionIndex)}
          disabled={question.choices.length >= MAX_CHOICES}
        >
          Add choice
        </Button>
      </div>
    </div>
  );
}
