import { handleDeleteQuiz, handleUpdateQuiz } from "@repo/quiz/routes";
import type { NextResponse } from "next/server";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  return handleUpdateQuiz(Number(id), request);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  return handleDeleteQuiz(Number(id));
}
