import { ApiError } from "@repo/auth/http";
import type {
  CreateQuizPayload,
  Quiz,
  QuizAttempt,
  SubmitAnswerPayload,
} from "../models/types";

const JSON_HEADERS = { "Content-Type": "application/json" };

async function parseJsonResponse<T>(res: Response): Promise<T> {
  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.message ?? "Something went wrong. Please try again.",
      data?.errors,
    );
  }

  return data as T;
}

export async function clientCreateQuiz(
  payload: CreateQuizPayload,
): Promise<{ data: Quiz }> {
  const res = await fetch("/api/quizzes", {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(res);
}

export async function clientUpdateQuiz(
  id: number,
  payload: CreateQuizPayload,
): Promise<{ data: Quiz }> {
  const res = await fetch(`/api/quizzes/${id}`, {
    method: "PUT",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  return parseJsonResponse(res);
}

export async function clientDeleteQuiz(id: number): Promise<void> {
  const res = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });

  await parseJsonResponse(res);
}

export async function clientStartQuizAttempt(
  quizId: number,
): Promise<{ data: QuizAttempt }> {
  const res = await fetch(`/api/quizzes/${quizId}/attempts`, {
    method: "POST",
  });

  return parseJsonResponse(res);
}

export async function clientSubmitQuizAnswer(
  attemptId: number,
  payload: SubmitAnswerPayload,
): Promise<void> {
  const res = await fetch(`/api/attempts/${attemptId}/answers`, {
    method: "POST",
    headers: JSON_HEADERS,
    body: JSON.stringify(payload),
  });

  await parseJsonResponse(res);
}

export async function clientCompleteQuizAttempt(
  attemptId: number,
): Promise<{ data: QuizAttempt }> {
  const res = await fetch(`/api/attempts/${attemptId}/complete`, {
    method: "POST",
  });

  return parseJsonResponse(res);
}
