import { getServerUser } from "@repo/auth/session";
import { MyQuizzesPage } from "@repo/quiz/pages/my-quizzes/MyQuizzesPage";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<ReactElement> {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const { page } = await searchParams;

  return (
    <main>
      <MyQuizzesPage page={page} />
    </main>
  );
}
