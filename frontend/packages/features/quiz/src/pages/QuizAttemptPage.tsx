import { ApiError } from "@repo/auth/http";
import { notFound } from "next/navigation";
import type { ReactElement } from "react";
import { getAttemptRequest, getQuizRequest } from "../api";
import { QuizSubmit } from "../components/QuizSubmit";
import { QuizLayout } from "../layouts/QuizLayout";

export async function QuizAttemptPage({
  id,
  attemptId,
}: {
  id: string;
  attemptId: string;
}): Promise<ReactElement> {
  const notFoundOn404Or403 = (error: unknown): never => {
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
    <QuizLayout>
      <div className="flex flex-1 flex-col items-center px-4 py-10">
        <div className="flex w-full max-w-2xl flex-col gap-6">
          <QuizSubmit quiz={quiz} attempt={attempt} />
        </div>
      </div>
    </QuizLayout>
  );
}
