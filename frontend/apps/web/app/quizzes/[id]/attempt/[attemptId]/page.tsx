import { ApiError } from "@repo/auth/http";
import { getServerUser } from "@repo/auth/session";
import { getAttemptRequest, getQuizRequest } from "@repo/quiz/api";
import { QuizAttemptRunner } from "@repo/quiz/components/QuizAttemptRunner";
import { notFound, redirect } from "next/navigation";

export default async function QuizAttemptPage({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const { id, attemptId } = await params;

  const notFoundOn404Or403 = (error: unknown) => {
    if (error instanceof ApiError && (error.status === 404 || error.status === 403)) {
      notFound();
    }
    throw error;
  };

  const [quiz, attempt] = await Promise.all([
    getQuizRequest(Number(id))
      .then(({ data }) => data)
      .catch(notFoundOn404Or403),
    getAttemptRequest(Number(attemptId))
      .then(({ data }) => data)
      .catch(notFoundOn404Or403),
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <QuizAttemptRunner quiz={quiz} attempt={attempt} />
      </div>
    </main>
  );
}
