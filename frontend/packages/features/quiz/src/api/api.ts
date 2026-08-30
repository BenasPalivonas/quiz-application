import { serverApiFetch } from "@repo/auth/session";
import type {
  CreateQuizPayload,
  PaginatedAttempts,
  PaginatedQuizzes,
  Quiz,
  QuizAttempt,
  SubmitAnswerPayload,
} from "../models/types";

export function createQuizRequest(
  payload: CreateQuizPayload,
): Promise<{ data: Quiz }> {
  return serverApiFetch<{ data: Quiz }>("/quizzes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getQuizRequest(id: number): Promise<{ data: Quiz }> {
  return serverApiFetch<{ data: Quiz }>(`/quizzes/${id}`);
}

export function updateQuizRequest(
  id: number,
  payload: CreateQuizPayload,
): Promise<{ data: Quiz }> {
  return serverApiFetch<{ data: Quiz }>(`/quizzes/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function listMyQuizzesRequest(
  page: number,
): Promise<PaginatedQuizzes> {
  return serverApiFetch<PaginatedQuizzes>(`/quizzes?mine=1&page=${page}`);
}

export function listQuizzesRequest(page: number): Promise<PaginatedQuizzes> {
  return serverApiFetch<PaginatedQuizzes>(`/quizzes?page=${page}`);
}

export function deleteQuizRequest(id: number): Promise<void> {
  return serverApiFetch<void>(`/quizzes/${id}`, { method: "DELETE" });
}

export function startAttemptRequest(
  quizId: number,
): Promise<{ data: QuizAttempt }> {
  return serverApiFetch<{ data: QuizAttempt }>(`/quizzes/${quizId}/attempts`, {
    method: "POST",
  });
}

export function getAttemptRequest(
  attemptId: number,
): Promise<{ data: QuizAttempt }> {
  return serverApiFetch<{ data: QuizAttempt }>(`/attempts/${attemptId}`);
}

export function listMyAttemptsRequest(
  page: number,
): Promise<PaginatedAttempts> {
  return serverApiFetch<PaginatedAttempts>(`/attempts?page=${page}`);
}

export function submitAnswerRequest(
  attemptId: number,
  payload: SubmitAnswerPayload,
): Promise<unknown> {
  return serverApiFetch(`/attempts/${attemptId}/answers`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function completeAttemptRequest(
  attemptId: number,
): Promise<{ data: QuizAttempt }> {
  return serverApiFetch<{ data: QuizAttempt }>(
    `/attempts/${attemptId}/complete`,
    { method: "POST" },
  );
}
