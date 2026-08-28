import { Skeleton } from "@repo/ui/skeleton";
import Link from "next/link";
import { Suspense, type ReactElement } from "react";
import { listMyQuizzesRequest } from "../api";
import { MyCreationsList } from "../components/MyCreationsList";
import { QuizLayout } from "../layouts/QuizLayout";

async function MyQuizzesListSection({
  page,
}: {
  page: number;
}): Promise<ReactElement> {
  const { data: quizzes, meta: paginationData } =
    await listMyQuizzesRequest(page);

  return <MyCreationsList quizzes={quizzes} paginationData={paginationData} />;
}

export function MyQuizzesPage({ page }: { page?: string }): ReactElement {
  const pageNumber = Math.max(1, Number(page) || 1);

  return (
    <QuizLayout>
      <div className="flex flex-1 flex-col items-center px-4 py-10">
        <div className="flex w-full max-w-2xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">My creations</h1>
            <Link href="/" className="text-sm text-white hover:text-white">
              Back
            </Link>
          </div>
          <Suspense
            key={pageNumber}
            fallback={<Skeleton className="block h-[792px] w-full" />}
          >
            <MyQuizzesListSection page={pageNumber} />
          </Suspense>
        </div>
      </div>
    </QuizLayout>
  );
}
