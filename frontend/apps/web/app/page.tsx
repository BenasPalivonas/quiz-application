import { getServerUser } from "@repo/auth/session";
import { QuizHomePage } from "@repo/quiz/pages/quiz-home/QuizHomePage";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { Navbar } from "./components/Navbar";

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
      <Navbar />
      <QuizHomePage userName={user.name} page={page} />
    </main>
  );
}
