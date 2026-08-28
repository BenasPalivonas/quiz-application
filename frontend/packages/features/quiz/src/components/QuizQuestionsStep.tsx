"use client";

import { Button } from "@repo/ui/button";
import { type FormEvent, type ReactElement, useState } from "react";
import { MAX_QUESTIONS } from "../question-consts";
import {
  useQuestionsStore,
  useQuestionsStoreApi,
} from "../stores/questions-store";
import { QuestionEditorForm } from "./QuestionEditorForm";

type QuizQuestionsStepProps = {
  title: string;
  fieldErrors: Record<string, string[]>;
  isSubmitting: boolean;
  submitButtonText: string;
  onEditTitle: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function QuizQuestionsStep({
  title,
  fieldErrors,
  isSubmitting,
  submitButtonText,
  onEditTitle,
  onSubmit,
}: QuizQuestionsStepProps): ReactElement {
  const questionsStoreApi = useQuestionsStoreApi();
  const questions = useQuestionsStore((state) => state.questions);
  const addQuestion = useQuestionsStore((state) => state.addQuestion);

  const [questionIndex, _setQuestionIndex] = useState(0);
  const setQuestionIndex = (index: number): void => {
    const lastIndex = questionsStoreApi.getState().questions.length - 1;
    _setQuestionIndex(Math.max(0, Math.min(index, lastIndex)));
  };
  const currentQuestion = questions[questionIndex];

  if (!currentQuestion) {
    return <></>;
  }

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
            Question {questionIndex + 1}/{questions.length}
          </span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setQuestionIndex(questionIndex - 1)}
              disabled={questionIndex <= 0}
            >
              Previous
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() => setQuestionIndex(questionIndex + 1)}
              disabled={questionIndex >= questions.length - 1}
            >
              Next
            </Button>
          </div>
        </div>

        <QuestionEditorForm
          question={currentQuestion}
          questionIndex={questionIndex}
          fieldErrors={fieldErrors}
        />
      </div>

      <Button
        type="button"
        variant="secondary"
        onClick={() => {
          addQuestion();
          setQuestionIndex(questions.length);
        }}
        disabled={questions.length >= MAX_QUESTIONS}
      >
        Add question
      </Button>

      <Button type="submit" disabled={isSubmitting}>
        {submitButtonText}
      </Button>
    </form>
  );
}
