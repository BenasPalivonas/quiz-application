import { handleSubmitAnswer } from "@repo/quiz/routes";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleSubmitAnswer(Number(id), request);
}
