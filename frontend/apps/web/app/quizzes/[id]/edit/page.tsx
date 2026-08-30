import { getServerUser } from "@repo/auth/session";
import { QuizCreatorPage } from "@repo/quiz/pages/quiz-creator/QuizCreatorPage";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { Navbar } from "../../../components/Navbar";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactElement> {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <main>
      <Navbar />
      <QuizCreatorPage id={id} />
    </main>
  );
}
