import { getServerUser } from "@repo/auth/session";
import { CreateQuizPage } from "@repo/quiz/pages/CreateQuizPage";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

export default async function Page(): Promise<ReactElement> {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main>
      <CreateQuizPage />
    </main>
  );
}
