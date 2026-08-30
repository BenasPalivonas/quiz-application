import { getServerUser } from "@repo/auth/session";
import { QuizAttemptPage } from "@repo/quiz/pages/quiz-attempt/QuizAttemptPage";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { Navbar } from "../../../../components/Navbar";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string; attemptId: string }>;
}): Promise<ReactElement> {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const { id, attemptId } = await params;

  return (
    <main>
      <Navbar />
      <QuizAttemptPage id={id} attemptId={attemptId} />
    </main>
  );
}
