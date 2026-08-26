import { ApiError } from "@repo/auth/http";
import { getServerUser } from "@repo/auth/session";
import { getQuizRequest } from "@repo/quiz/api";
import { QuizForm } from "@repo/quiz/components/QuizForm";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

export default async function EditQuizPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

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
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Edit quiz</h1>
          <Link href="/quizzes/mine" className="text-sm text-white hover:text-white">
            Back
          </Link>
        </div>
        <QuizForm quiz={quiz} />
      </div>
    </main>
  );
}
