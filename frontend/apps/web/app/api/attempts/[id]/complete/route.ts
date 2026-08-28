import { handleCompleteAttempt } from "@repo/quiz/routes";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleCompleteAttempt(Number(id));
}
