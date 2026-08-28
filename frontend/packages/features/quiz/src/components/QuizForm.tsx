"use client";

import { ApiError } from "@repo/auth/http";
import { Toast } from "@repo/ui/toast";
import { useRouter } from "next/navigation";
import { useState, type FormEvent, type ReactElement } from "react";
import { useStore } from "zustand";
import { clientCreateQuiz, clientUpdateQuiz } from "../client-api";
import {
  QuestionsStoreContext,
  createQuestionsStore,
  emptyQuestion,
} from "../stores/questions-store";
import type { QuestionInput, Quiz } from "../types";
import { QuizQuestionsStep } from "./QuizQuestionsStep";
import { QuizTitleStep } from "./QuizTitleStep";

function questionsFromQuiz(quiz: Quiz): QuestionInput[] {
  if (!quiz.questions || quiz.questions.length === 0) {
    return [emptyQuestion()];
  }

  return quiz.questions.map((question) => ({
    text: question.text,
    choices: question.choices.map((choice) => ({ text: choice.text })),
  }));
}

export function QuizForm({ quiz }: { quiz?: Quiz }): ReactElement {
  const router = useRouter();

  const [step, setStep] = useState<"title" | "questions">("title");
  const [title, setTitle] = useState(quiz?.title ?? "");

  const [questionsStore] = useState(() =>
    createQuestionsStore(quiz ? questionsFromQuiz(quiz) : [emptyQuestion()]),
  );
  const questions = useStore(questionsStore, (state) => state.questions);

  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleContinue(): void {
    if (!title.trim()) {
      setFieldErrors({ title: ["Title is required"] });
      return;
    }
    setFieldErrors({});
    setStep("questions");
  }

  const submitButtonText = quiz ? "Save changes" : "Create quiz";

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
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
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      {step === "title" ? (
        <QuizTitleStep
          title={title}
          onTitleChange={setTitle}
          errors={fieldErrors.title}
          onContinue={handleContinue}
        />
      ) : (
        <QuestionsStoreContext.Provider value={questionsStore}>
          <QuizQuestionsStep
            title={title}
            fieldErrors={fieldErrors}
            isSubmitting={isSubmitting}
            submitButtonText={submitButtonText}
            onEditTitle={() => setStep("title")}
            onSubmit={handleSubmit}
          />
        </QuestionsStoreContext.Provider>
      )}
      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </>
  );
}
