import { handleStartAttempt } from "@repo/quiz/routes";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleStartAttempt(Number(id));
}
