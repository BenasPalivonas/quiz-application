import { handleDeleteQuiz, handleUpdateQuiz } from "@repo/quiz/routes";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleUpdateQuiz(Number(id), request);
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  return handleDeleteQuiz(Number(id));
}
