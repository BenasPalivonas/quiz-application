import { serverApiFetch } from "@repo/auth/session";
import type {
  CreateQuizPayload,
  PaginatedAttempts,
  PaginatedQuizzes,
  Quiz,
  QuizAttempt,
  SubmitAnswerPayload,
} from "./types";

export function createQuizRequest(payload: CreateQuizPayload) {
  return serverApiFetch<{ data: Quiz }>("/quizzes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getQuizRequest(id: number) {
  return serverApiFetch<{ data: Quiz }>(`/quizzes/${id}`);
}

export function updateQuizRequest(id: number, payload: CreateQuizPayload) {
  return serverApiFetch<{ data: Quiz }>(`/quizzes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function listMyQuizzesRequest(page: number) {
  return serverApiFetch<PaginatedQuizzes>(`/quizzes?mine=1&page=${page}`);
}

export function listQuizzesRequest(page: number) {
  return serverApiFetch<PaginatedQuizzes>(`/quizzes?page=${page}`);
}

export function deleteQuizRequest(id: number) {
  return serverApiFetch<void>(`/quizzes/${id}`, { method: "DELETE" });
}

export function startAttemptRequest(quizId: number) {
  return serverApiFetch<{ data: QuizAttempt }>(`/quizzes/${quizId}/attempts`, {
    method: "POST",
  });
}

export function getAttemptRequest(attemptId: number) {
  return serverApiFetch<{ data: QuizAttempt }>(`/attempts/${attemptId}`);
}

export function listMyAttemptsRequest(page: number) {
  return serverApiFetch<PaginatedAttempts>(`/attempts?page=${page}`);
}

export function submitAnswerRequest(
  attemptId: number,
  payload: SubmitAnswerPayload,
) {
  return serverApiFetch(`/attempts/${attemptId}/answers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completeAttemptRequest(attemptId: number) {
  return serverApiFetch<{ data: QuizAttempt }>(
    `/attempts/${attemptId}/complete`,
    { method: "POST" },
  );
}
