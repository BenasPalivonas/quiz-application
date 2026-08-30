import { getServerUser } from "@repo/auth/session";
import { QuizCreatorPage } from "@repo/quiz/pages/quiz-creator/QuizCreatorPage";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

export default async function Page(): Promise<ReactElement> {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main>
      <QuizCreatorPage />
    </main>
  );
}
