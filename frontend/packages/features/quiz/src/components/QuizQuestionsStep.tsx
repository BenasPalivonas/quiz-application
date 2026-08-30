"use client";

import { ApiError } from "@repo/auth/http";
import { Button } from "@repo/ui/button";
import { Toast } from "@repo/ui/toast";
import { useRouter } from "next/navigation";
import { type ReactElement, type SubmitEvent, useRef, useState } from "react";
import { clientCreateQuiz, clientUpdateQuiz } from "../api/client-api";
import { MAX_QUESTIONS } from "../models/question-consts";
import type { Quiz } from "../models/types";
import { useQuizStore, useQuizStoreApi } from "../stores/quiz-store";
import { QuestionEditorForm } from "./QuestionEditorForm";

type QuizQuestionsStepProps = {
  quiz?: Quiz;
  setEditTitleStep: () => void;
};

export function QuizQuestionsStep({
  quiz,
  setEditTitleStep,
}: QuizQuestionsStepProps): ReactElement {
  const router = useRouter();

  const quizStoreApi = useQuizStoreApi();
  const title = useQuizStore((state) => state.title);
  const questions = useQuizStore((state) => state.questions);
  const addQuestion = useQuizStore((state) => state.addQuestion);

  const [questionIndex, _setQuestionIndex] = useState(0);
  const setQuestionIndex = (index: number): void => {
    const lastIndex = quizStoreApi.getState().questions.length - 1;
    _setQuestionIndex(Math.max(0, Math.min(index, lastIndex)));
  };
  const currentQuestion = questions[questionIndex];

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const submitButtonText = quiz ? "Save changes" : "Create quiz";

  async function handleSubmit(
    event: SubmitEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    if (isSubmittingRef.current) {
      return;
    }
    isSubmittingRef.current = true;
    setFieldErrors({});
    setToastMessage(null);
    setIsSubmitting(true);

    try {
      if (quiz) {
        await clientUpdateQuiz(quiz.id, { title, questions });
        router.push("/quizzes/mine");
      } else {
        await clientCreateQuiz({ title, questions });
        router.push("/");
      }
      router.refresh();
      return;
    } catch (error) {
      if (error instanceof ApiError) {
        const errors = error.errors ?? {};
        setFieldErrors(errors);
        if (Object.keys(errors).some((key) => key.startsWith("questions"))) {
          setToastMessage(
            "Some questions or choices are missing information. Please review every question before creating the quiz.",
          );
        } else if (!error.errors) {
          setToastMessage(error.message);
        }
      } else {
        setToastMessage("Something went wrong. Please try again.");
      }
    }

    isSubmittingRef.current = false;
    setIsSubmitting(false);
  }

  if (!currentQuestion) {
    return <></>;
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="flex w-full flex-col gap-6">
        <div className="flex flex-col gap-1">
          <div className="flex justify-center items-center flex-col  gap-8">
            <span className="text-xl flex font-medium">
              Quiz title: {title}
            </span>
            <Button
              type="button"
              variant="secondary"
              onClick={setEditTitleStep}
            >
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
      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </>
  );
}
