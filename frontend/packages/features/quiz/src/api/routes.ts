import { withApiErrorHandling } from "@repo/api/route-handler";
import { NextResponse } from "next/server";
import type { CreateQuizPayload, SubmitAnswerPayload } from "../models/types";
import {
  completeAttemptRequest,
  createQuizRequest,
  deleteQuizRequest,
  startAttemptRequest,
  submitAnswerRequest,
  updateQuizRequest,
} from "./api";

export async function handleCreateQuiz(
  request: Request,
): Promise<NextResponse> {
  const body = (await request.json()) as CreateQuizPayload;

  return withApiErrorHandling(
    () => createQuizRequest(body),
    ({ data }) => NextResponse.json({ data }, { status: 201 }),
  );
}

export async function handleUpdateQuiz(
  id: number,
  request: Request,
): Promise<NextResponse> {
  const body = (await request.json()) as CreateQuizPayload;

  return withApiErrorHandling(
    () => updateQuizRequest(id, body),
    ({ data }) => NextResponse.json({ data }),
  );
}

export async function handleDeleteQuiz(id: number): Promise<NextResponse> {
  return withApiErrorHandling(
    () => deleteQuizRequest(id),
    () => new NextResponse(null, { status: 204 }),
  );
}

export async function handleStartAttempt(
  quizId: number,
): Promise<NextResponse> {
  return withApiErrorHandling(
    () => startAttemptRequest(quizId),
    ({ data }) => NextResponse.json({ data }, { status: 201 }),
  );
}

export async function handleSubmitAnswer(
  attemptId: number,
  request: Request,
): Promise<NextResponse> {
  const body = (await request.json()) as SubmitAnswerPayload;

  return withApiErrorHandling(
    () => submitAnswerRequest(attemptId, body),
    () => NextResponse.json({}, { status: 200 }),
  );
}

export async function handleCompleteAttempt(
  attemptId: number,
): Promise<NextResponse> {
  return withApiErrorHandling(
    () => completeAttemptRequest(attemptId),
    ({ data }) => NextResponse.json({ data }),
  );
}
