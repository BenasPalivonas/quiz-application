import { getServerUser } from "@repo/auth/session";
import { QuizAttemptPage } from "@repo/quiz/pages/QuizAttemptPage";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}) {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const { id, attemptId } = await params;

  return (
    <main>
      <QuizAttemptPage id={id} attemptId={attemptId} />
    </main>
  );
}
