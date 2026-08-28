import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import Link from "next/link";
import { Suspense, type ReactElement } from "react";
import { listQuizzesRequest } from "../api";
import { QuizList } from "../components/QuizList";
import { QuizLayout } from "../layouts/QuizLayout";

async function QuizListSection({
  page,
}: {
  page: number;
}): Promise<ReactElement> {
  const { data: quizzes, meta: paginationData } =
    await listQuizzesRequest(page);

  return <QuizList quizzes={quizzes} paginationData={paginationData} />;
}

export function QuizHomePage({
  userName,
  page: pageParam,
}: {
  userName: string;
  page?: string;
}): ReactElement {
  const page = Math.max(1, Number(pageParam) || 1);

  return (
    <QuizLayout>
      <div className="flex flex-1 flex-col items-center gap-8 px-4 py-10">
        <div>
          <p className="text-lg">
            Welcome, <span className="font-semibold">{userName}</span>
          </p>
          <Link href="/quizzes/create">
            <Button type="button">Create a quiz</Button>
          </Link>
        </div>
        <Suspense
          key={page}
          fallback={<Skeleton className="block h-[900px] w-[672px]" />}
        >
          <QuizListSection page={page} />
        </Suspense>
      </div>
    </QuizLayout>
  );
}
