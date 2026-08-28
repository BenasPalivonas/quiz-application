"use client";

import { useState, type ReactElement } from "react";
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
  const [step, setStep] = useState<"title" | "questions">("title");
  const [title, setTitle] = useState(quiz?.title ?? "");

  const [questionsStore] = useState(() =>
    createQuestionsStore(quiz ? questionsFromQuiz(quiz) : [emptyQuestion()]),
  );

  return step === "title" ? (
    <QuizTitleStep
      title={title}
      onTitleChange={setTitle}
      onContinue={() => setStep("questions")}
    />
  ) : (
    <QuestionsStoreContext.Provider value={questionsStore}>
      <QuizQuestionsStep
        quiz={quiz}
        title={title}
        onEditTitle={() => setStep("title")}
      />
    </QuestionsStoreContext.Provider>
  );
}
