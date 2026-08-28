"use client";

import { Button } from "@repo/ui/button";
import { ErrorText } from "@repo/ui/error-text";
import type { FormEvent, ReactElement } from "react";
import { MAX_QUESTIONS } from "../question-consts";
import { useQuestionsStore } from "../stores/questions-store";
import { QuestionEditorForm } from "./QuestionEditorForm";

type QuizQuestionsStepProps = {
  title: string;
  fieldErrors: Record<string, string[]>;
  formError: string | null;
  isSubmitting: boolean;
  submitButtonText: string;
  onEditTitle: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function QuizQuestionsStep({
  title,
  fieldErrors,
  formError,
  isSubmitting,
  submitButtonText,
  onEditTitle,
  onSubmit,
}: QuizQuestionsStepProps): ReactElement {
  const questions = useQuestionsStore((state) => state.questions);
  const currentQuestionIndex = useQuestionsStore(
    (state) => state.currentQuestionIndex,
  );
  const addQuestion = useQuestionsStore((state) => state.addQuestion);
  const goToPreviousQuestion = useQuestionsStore(
    (state) => state.goToPreviousQuestion,
  );
  const goToNextQuestion = useQuestionsStore((state) => state.goToNextQuestion);

  return (
    <form onSubmit={onSubmit} className="flex w-full flex-col gap-6">
      <div className="flex flex-col gap-1">
        <div className="flex justify-center items-center flex-col  gap-8">
          <span className="text-xl flex font-medium">Quiz title: {title}</span>
          <Button type="button" variant="secondary" onClick={onEditTitle}>
            Edit title
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm">
            Question {currentQuestionIndex + 1}/{questions.length}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={goToPreviousQuestion}
              disabled={currentQuestionIndex <= 0}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={goToNextQuestion}
              disabled={currentQuestionIndex >= questions.length - 1}
            >
              Next
            </Button>
          </div>
        </div>

        {questions.map((question, questionIndex) =>
          questionIndex === currentQuestionIndex ? (
            <QuestionEditorForm
              key={questionIndex}
              question={question}
              questionIndex={questionIndex}
              fieldErrors={fieldErrors}
            />
          ) : null,
        )}
      </div>

      {fieldErrors.questions && (
        <ErrorText>{fieldErrors.questions[0]}</ErrorText>
      )}

      <Button
        type="button"
        variant="secondary"
        onClick={addQuestion}
        disabled={questions.length >= MAX_QUESTIONS}
      >
        Add question
      </Button>

      {formError && <ErrorText>{formError}</ErrorText>}

      <Button type="submit" disabled={isSubmitting}>
        {submitButtonText}
      </Button>
    </form>
  );
}
