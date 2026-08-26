import { ApiError } from "@repo/auth/http";
import { NextResponse } from "next/server";
import { createQuizRequest } from "./api";
import type { CreateQuizPayload } from "./types";

export async function handleCreateQuiz(request: Request) {
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
