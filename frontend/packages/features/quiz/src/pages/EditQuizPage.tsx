import { ApiError } from "@repo/auth/http";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import type { ReactElement } from "react";
import { getQuizRequest } from "../api/api";
import { QuizForm } from "../components/QuizForm";
import { QuizLayout } from "../layouts/QuizLayout";

export async function EditQuizPage({
  id,
}: {
  id: string;
}): Promise<ReactElement> {
  const quiz = await getQuizRequest(Number(id))
    .then(({ data }) => data)
    .catch((error) => {
      if (error instanceof ApiError && error.status === 404) {
        notFound();
      }
      throw error;
    });

  if (!quiz.is_owner) {
    redirect("/quizzes/mine");
  }

  return (
    <QuizLayout>
      <div className="flex flex-1 flex-col items-center px-4 py-10">
        <div className="flex w-full max-w-xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Edit quiz</h1>
            <Link
              href="/quizzes/mine"
              className="text-sm text-white hover:text-white"
            >
              Back
            </Link>
          </div>
          <QuizForm quiz={quiz} />
        </div>
      </div>
    </QuizLayout>
  );
}
