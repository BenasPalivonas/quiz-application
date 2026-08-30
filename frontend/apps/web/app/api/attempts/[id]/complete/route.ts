import { handleCompleteAttempt } from "@repo/quiz/api/routes";
import type { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
): Promise<NextResponse> {
  const { id } = await params;
  return handleCompleteAttempt(Number(id));
}
