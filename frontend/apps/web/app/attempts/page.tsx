import { getServerUser } from "@repo/auth/session";
import { listMyAttemptsRequest } from "@repo/quiz/api";
import { MyAttemptsList } from "@repo/quiz/components/MyAttemptsList";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function MyAttemptsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const { page: pageParam } = await searchParams;
  const page = Math.max(1, Number(pageParam) || 1);

  const { data: attempts, meta: paginationData } =
    await listMyAttemptsRequest(page);

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      <div className="flex w-full max-w-2xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">My quizzes</h1>
          <Link href="/" className="text-sm text-white hover:text-white">
            Back
          </Link>
        </div>
        <MyAttemptsList attempts={attempts} paginationData={paginationData} />
      </div>
    </main>
  );
}
