import { serverApiFetch } from "@repo/auth/session";
import type { CreateQuizPayload, Quiz } from "./types";

export function createQuizRequest(payload: CreateQuizPayload) {
  return serverApiFetch<{ data: Quiz }>("/quizzes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
