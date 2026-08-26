"use client";

import { ApiError } from "@repo/auth/http";
import { Toast } from "@repo/ui/toast";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { clientCreateQuiz } from "../client-api";
import { emptyQuestion } from "../question-defaults";
import type { QuestionInput } from "../types";
import { QuizQuestionsStep } from "./QuizQuestionsStep";
import { QuizTitleStep } from "./QuizTitleStep";

export function CreateQuizForm() {
  const router = useRouter();

  const [step, setStep] = useState<"title" | "questions">("title");
  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionInput[]>([emptyQuestion()]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleContinue() {
    if (!title.trim()) {
      setFieldErrors({ title: ["Title is required"] });
      return;
    }
    setFieldErrors({});
    setStep("questions");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);
    setFieldErrors({});
    setToastMessage(null);
    setIsSubmitting(true);

    try {
      await clientCreateQuiz({ title, questions });
      router.push("/");
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
          setFormError(error.message);
        }
      } else {
        setFormError("Something went wrong. Please try again.");
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
        <QuizQuestionsStep
          title={title}
          questions={questions}
          setQuestions={setQuestions}
          fieldErrors={fieldErrors}
          formError={formError}
          isSubmitting={isSubmitting}
          onEditTitle={() => setStep("title")}
          onSubmit={handleSubmit}
        />
      )}
      {toastMessage && (
        <Toast message={toastMessage} onDismiss={() => setToastMessage(null)} />
      )}
    </>
  );
}
