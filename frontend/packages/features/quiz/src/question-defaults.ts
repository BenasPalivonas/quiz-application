import type { ChoiceInput, QuestionInput } from "./types";

export const MAX_QUESTIONS = 10;
export const MIN_CHOICES = 2;
export const MAX_CHOICES = 10;

export function emptyChoice(): ChoiceInput {
  return { text: "" };
}

export function emptyQuestion(): QuestionInput {
  return { text: "", choices: [emptyChoice(), emptyChoice()] };
}
