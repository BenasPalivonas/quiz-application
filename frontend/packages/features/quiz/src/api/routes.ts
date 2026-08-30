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

export class ApiError extends Error {
  status: number;
  errors?: Record<string, string[]>;

  constructor(status: number, message: string, errors?: Record<string, string[]>) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
  }
}

export async function withApiErrorHandling<T>(
  action: () => Promise<T>,
  onSuccess: (data: T) => NextResponse,
): Promise<NextResponse> {
  try {
    return onSuccess(await action());
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, errors: error.errors },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}

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
