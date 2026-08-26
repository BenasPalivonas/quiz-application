import { serverApiFetch } from "@repo/auth/session";
import type { CreateQuizPayload, PaginatedQuizzes, Quiz } from "./types";

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

export function deleteQuizRequest(id: number) {
  return serverApiFetch<void>(`/quizzes/${id}`, { method: "DELETE" });
}
