import { getServerUser } from "@repo/auth/session";
import { QuizPage } from "@repo/quiz/components/QuizPage";
import { Navbar } from "@/components/Navbar";
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
    <main className="flex min-h-screen flex-col">
      <Navbar />
      <QuizPage userName={user.name} page={page} />
    </main>
  );
}
