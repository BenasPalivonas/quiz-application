"use client";

import { Button } from "@repo/ui/button";
import { ErrorText } from "@repo/ui/error-text";
import {
  useState,
  type Dispatch,
  type FormEvent,
  type SetStateAction,
} from "react";
import { MAX_CHOICES, MAX_QUESTIONS, MIN_CHOICES } from "../question-consts";
import type { ChoiceInput, QuestionInput } from "../types";
import { QuestionEditorForm } from "./QuestionEditorForm";

function emptyChoice(): ChoiceInput {
  return { text: "" };
}

function emptyQuestion(): QuestionInput {
  return { text: "", choices: [emptyChoice(), emptyChoice()] };
}

type QuizQuestionsStepProps = {
  title: string;
  questions: QuestionInput[];
  setQuestions: Dispatch<SetStateAction<QuestionInput[]>>;
  fieldErrors: Record<string, string[]>;
  formError: string | null;
  isSubmitting: boolean;
  onEditTitle: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
};

export function QuizQuestionsStep({
  title,
  questions,
  setQuestions,
  fieldErrors,
  formError,
  isSubmitting,
  onEditTitle,
  onSubmit,
}: QuizQuestionsStepProps) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  function updateQuestionText(questionIndex: number, text: string) {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex ? { ...question, text } : question,
      ),
    );
  }

  function addQuestion() {
    setQuestions((prev) => {
      if (prev.length >= MAX_QUESTIONS) return prev;
      const next = [...prev, emptyQuestion()];
      setCurrentQuestionIndex(next.length - 1);
      return next;
    });
  }

  function removeQuestion(questionIndex: number) {
    setQuestions((prev) => {
      if (prev.length <= 1) return prev;
      const next = prev.filter((_, index) => index !== questionIndex);
      setCurrentQuestionIndex((current) => Math.min(current, next.length - 1));
      return next;
    });
  }

  function goToPreviousQuestion() {
    setCurrentQuestionIndex((current) => Math.max(0, current - 1));
  }

  function goToNextQuestion() {
    setCurrentQuestionIndex((current) =>
      Math.min(questions.length - 1, current + 1),
    );
  }

  function updateChoiceText(
    questionIndex: number,
    choiceIndex: number,
    text: string,
  ) {
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

  function addChoice(questionIndex: number) {
    setQuestions((prev) =>
      prev.map((question, index) =>
        index === questionIndex && question.choices.length < MAX_CHOICES
          ? { ...question, choices: [...question.choices, emptyChoice()] }
          : question,
      ),
    );
  }

  function removeChoice(questionIndex: number, choiceIndex: number) {
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
              canRemoveQuestion={questions.length > 1}
              fieldErrors={fieldErrors}
              onUpdateQuestionText={updateQuestionText}
              onRemoveQuestion={removeQuestion}
              onUpdateChoiceText={updateChoiceText}
              onAddChoice={addChoice}
              onRemoveChoice={removeChoice}
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
        {isSubmitting ? "Creating..." : "Create quiz"}
      </Button>
    </form>
  );
}
