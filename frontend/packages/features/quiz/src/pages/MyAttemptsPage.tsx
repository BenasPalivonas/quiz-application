import Link from "next/link";
import type { ReactElement } from "react";
import { listMyAttemptsRequest } from "../api";
import { MyAttemptsList } from "../components/MyAttemptsList";
import { QuizLayout } from "../layouts/QuizLayout";

export async function MyAttemptsPage({
  page,
}: {
  page?: string;
}): Promise<ReactElement> {
  const pageNumber = Math.max(1, Number(page) || 1);

  const { data: attempts, meta: paginationData } =
    await listMyAttemptsRequest(pageNumber);

  return (
    <QuizLayout>
      <div className="flex flex-1 flex-col items-center px-4 py-10">
        <div className="flex w-full max-w-2xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">My quizzes</h1>
            <Link href="/" className="text-sm text-white hover:text-white">
              Back
            </Link>
          </div>
          <MyAttemptsList
            attempts={attempts}
            paginationData={paginationData}
          />
        </div>
      </div>
    </QuizLayout>
  );
}
