import { LogoutButton } from "@repo/auth/components/LogoutButton";
import { getServerUser } from "@repo/auth/session";
import { QuizPage } from "@repo/quiz/components/QuizPage";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <QuizPage userName={user.name} />
      <LogoutButton />
    </main>
  );
}
