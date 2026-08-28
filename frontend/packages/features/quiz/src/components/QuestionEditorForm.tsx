"use client";

import { Button } from "@repo/ui/button";
import { ErrorText } from "@repo/ui/error-text";
import { Input } from "@repo/ui/input";
import type { Dispatch, ReactElement, SetStateAction } from "react";
import { MAX_CHOICES, MIN_CHOICES } from "../question-consts";
import type { QuestionInput } from "../types";

type QuestionEditorFormProps = {
  question: QuestionInput;
  questionIndex: number;
  canRemoveQuestion: boolean;
  fieldErrors: Record<string, string[]>;
  setQuestions: Dispatch<SetStateAction<QuestionInput[]>>;
  setCurrentQuestionIndex: Dispatch<SetStateAction<number>>;
};

export function QuestionEditorForm({
  question,
  questionIndex,
  canRemoveQuestion,
  fieldErrors,
  setQuestions,
  setCurrentQuestionIndex,
}: QuestionEditorFormProps): ReactElement {
  function updateQuestionText(text: string): void {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex ? { ...question, text } : question,
      ),
    );
  }

  function removeQuestion(): void {
    setQuestions((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, index) => index !== questionIndex);
      setCurrentQuestionIndex((current) => Math.min(current, next.length - 1));
      return next;
    });
  }

  function updateChoiceText(choiceIndex: number, text: string): void {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex
          ? {
              ...question,
              choices: question.choices.map((choice, cIndex) =>
                cIndex === choiceIndex ? { ...choice, text } : choice,
              ),
            }
          : question,
      ),
    );
  }

  function addChoice(): void {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex && question.choices.length < MAX_CHOICES
          ? { ...question, choices: [...question.choices, { text: "" }] }
          : question,
      ),
    );
  }

  function removeChoice(choiceIndex: number): void {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex && question.choices.length > MIN_CHOICES
          ? {
              ...question,
              choices: question.choices.filter(
                (_, cIndex) => cIndex !== choiceIndex,
              ),
            }
          : question,
      ),
    );
  }

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
            onChange={(e) => updateQuestionText(e.target.value)}
            errors={fieldErrors[`questions.${questionIndex}.text`]}
          />
        </div>
        <Button
          type="button"
          variant="secondary"
          className="mt-6"
          onClick={removeQuestion}
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
                onChange={(e) => updateChoiceText(choiceIndex, e.target.value)}
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
              onClick={() => removeChoice(choiceIndex)}
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
          onClick={addChoice}
          disabled={question.choices.length >= MAX_CHOICES}
        >
          Add choice
        </Button>
      </div>
    </div>
  );
}
