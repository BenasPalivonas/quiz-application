import { getServerUser } from "@repo/auth/session";
import { QuizHomePage } from "@repo/quiz/pages/QuizHomePage";
import { redirect } from "next/navigation";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const { page } = await searchParams;

  return (
    <main>
      <QuizHomePage userName={user.name} page={page} />
    </main>
  );
}
