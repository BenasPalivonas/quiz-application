import { ApiError } from "@repo/auth/http";
import { NextResponse } from "next/server";
import {
  completeAttemptRequest,
  createQuizRequest,
  deleteQuizRequest,
  startAttemptRequest,
  submitAnswerRequest,
  updateQuizRequest,
} from "./api";
import type { CreateQuizPayload, SubmitAnswerPayload } from "./types";

export async function handleCreateQuiz(
  request: Request,
): Promise<NextResponse> {
  const body = (await request.json()) as CreateQuizPayload;

  try {
    const { data } = await createQuizRequest(body);
    return NextResponse.json({ data }, { status: 201 });
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

export async function handleUpdateQuiz(
  id: number,
  request: Request,
): Promise<NextResponse> {
  const body = (await request.json()) as CreateQuizPayload;

  try {
    const { data } = await updateQuizRequest(id, body);
    return NextResponse.json({ data });
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

export async function handleDeleteQuiz(id: number): Promise<NextResponse> {
  try {
    await deleteQuizRequest(id);
    return new NextResponse(null, { status: 204 });
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

export async function handleStartAttempt(
  quizId: number,
): Promise<NextResponse> {
  try {
    const { data } = await startAttemptRequest(quizId);
    return NextResponse.json({ data }, { status: 201 });
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

export async function handleSubmitAnswer(
  attemptId: number,
  request: Request,
): Promise<NextResponse> {
  const body = (await request.json()) as SubmitAnswerPayload;

  try {
    await submitAnswerRequest(attemptId, body);
    return NextResponse.json({}, { status: 200 });
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

export async function handleCompleteAttempt(
  attemptId: number,
): Promise<NextResponse> {
  try {
    const { data } = await completeAttemptRequest(attemptId);
    return NextResponse.json({ data });
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
