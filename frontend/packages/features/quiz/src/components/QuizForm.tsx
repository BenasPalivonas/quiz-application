"use client";

import { useState, type ReactElement } from "react";
import type { QuestionInput, Quiz } from "../models/types";
import {
  QuizStoreContext,
  createQuizStore,
  emptyQuestion,
} from "../stores/quiz-store";
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
  const [step, setStep] = useState<"title" | "questions">("title");

  const [quizStore] = useState(() =>
    createQuizStore(
      quiz?.title ?? "",
      quiz ? questionsFromQuiz(quiz) : [emptyQuestion()],
    ),
  );

  return (
    <QuizStoreContext.Provider value={quizStore}>
      {step === "title" ? (
        <QuizTitleStep setEditQuestionsStep={() => setStep("questions")} />
      ) : (
        <QuizQuestionsStep
          quiz={quiz}
          setEditTitleStep={() => setStep("title")}
        />
      )}
    </QuizStoreContext.Provider>
  );
}
