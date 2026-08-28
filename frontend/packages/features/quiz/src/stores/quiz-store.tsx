"use client";

import { createContext, useContext } from "react";
import { createStore, useStore, type StoreApi } from "zustand";
import { MAX_CHOICES, MAX_QUESTIONS, MIN_CHOICES } from "../question-consts";
import type { ChoiceInput, QuestionInput } from "../types";

export function emptyChoice(): ChoiceInput {
  return { text: "" };
}

export function emptyQuestion(): QuestionInput {
  return { text: "", choices: [emptyChoice(), emptyChoice()] };
}

type QuizState = {
  title: string;
  questions: QuestionInput[];
};

type QuizActions = {
  setTitle: (title: string) => void;
  addQuestion: () => void;
  removeQuestion: (questionIndex: number) => void;
  updateQuestionText: (questionIndex: number, text: string) => void;
  updateChoiceText: (
    questionIndex: number,
    choiceIndex: number,
    text: string,
  ) => void;
  addChoice: (questionIndex: number) => void;
  removeChoice: (questionIndex: number, choiceIndex: number) => void;
};

type QuizStore = QuizState & QuizActions;

export function createQuizStore(
  initialTitle: string,
  initialQuestions: QuestionInput[],
): StoreApi<QuizStore> {
  return createStore<QuizStore>()((set) => ({
    title: initialTitle,
    questions: initialQuestions,

    setTitle: (title): void => set({ title }),

    addQuestion: (): void =>
      set((state) => {
        if (state.questions.length >= MAX_QUESTIONS) return state;
        return { questions: [...state.questions, emptyQuestion()] };
      }),

    removeQuestion: (questionIndex): void =>
      set((state) => {
        if (state.questions.length <= 1) return state;
        return {
          questions: state.questions.filter(
            (_, index) => index !== questionIndex,
          ),
        };
      }),

    updateQuestionText: (questionIndex, text): void =>
      set((state) => ({
        questions: state.questions.map((question, index) =>
          index === questionIndex ? { ...question, text } : question,
        ),
      })),

    updateChoiceText: (questionIndex, choiceIndex, text): void =>
      set((state) => ({
        questions: state.questions.map((question, index) =>
          index === questionIndex
            ? {
                ...question,
                choices: question.choices.map((choice, cIndex) =>
                  cIndex === choiceIndex ? { ...choice, text } : choice,
                ),
              }
            : question,
        ),
      })),

    addChoice: (questionIndex): void =>
      set((state) => ({
        questions: state.questions.map((question, index) =>
          index === questionIndex && question.choices.length < MAX_CHOICES
            ? { ...question, choices: [...question.choices, emptyChoice()] }
            : question,
        ),
      })),

    removeChoice: (questionIndex, choiceIndex): void =>
      set((state) => ({
        questions: state.questions.map((question, index) =>
          index === questionIndex && question.choices.length > MIN_CHOICES
            ? {
                ...question,
                choices: question.choices.filter(
                  (_, cIndex) => cIndex !== choiceIndex,
                ),
              }
            : question,
        ),
      })),

  }));
}

export type QuizStoreApi = ReturnType<typeof createQuizStore>;

export const QuizStoreContext = createContext<QuizStoreApi | null>(null);

export function useQuizStoreApi(): QuizStoreApi {
  const store = useContext(QuizStoreContext);
  if (!store) {
    throw new Error("useQuizStore must be used within a QuizStoreProvider");
  }
  return store;
}

export function useQuizStore<T>(selector: (state: QuizStore) => T): T {
  return useStore(useQuizStoreApi(), selector);
}
