import { clientFetch } from "@repo/api/http";
import type {
  CreateQuizPayload,
  Quiz,
  QuizAttempt,
  SubmitAnswerPayload,
} from "../models/types";

export function clientCreateQuiz(
  payload: CreateQuizPayload,
): Promise<{ data: Quiz }> {
  return clientFetch<{ data: Quiz }>("/api/quizzes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function clientUpdateQuiz(
  id: number,
  payload: CreateQuizPayload,
): Promise<{ data: Quiz }> {
  return clientFetch<{ data: Quiz }>(`/api/quizzes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function clientDeleteQuiz(id: number): Promise<void> {
  return clientFetch<void>(`/api/quizzes/${id}`, { method: "DELETE" });
}

export function clientStartQuizAttempt(
  quizId: number,
): Promise<{ data: QuizAttempt }> {
  return clientFetch<{ data: QuizAttempt }>(`/api/quizzes/${quizId}/attempts`, {
    method: "POST",
  });
}

export function clientSubmitQuizAnswer(
  attemptId: number,
  payload: SubmitAnswerPayload,
): Promise<void> {
  return clientFetch<void>(`/api/attempts/${attemptId}/answers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function clientCompleteQuizAttempt(
  attemptId: number,
): Promise<{ data: QuizAttempt }> {
  return clientFetch<{ data: QuizAttempt }>(
    `/api/attempts/${attemptId}/complete`,
    { method: "POST" },
  );
}
