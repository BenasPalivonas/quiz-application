import { ApiError } from "@repo/auth/http";
import type { CreateQuizPayload, Quiz } from "./types";

export async function clientCreateQuiz(payload: CreateQuizPayload) {
  const res = await fetch("/api/quizzes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.message ?? "Something went wrong. Please try again.",
      data?.errors,
    );
  }

  return data as { data: Quiz };
}

export async function clientDeleteQuiz(id: number) {
  const res = await fetch(`/api/quizzes/${id}`, { method: "DELETE" });

  if (!res.ok) {
    const data = await res.json().catch(() => null);
    throw new ApiError(
      res.status,
      data?.message ?? "Something went wrong. Please try again.",
      data?.errors,
    );
  }
}
