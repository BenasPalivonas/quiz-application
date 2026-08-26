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
    <main className="flex min-h-screen flex-col">
      <nav className="flex w-full justify-end px-4 py-4">
        <LogoutButton />
      </nav>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <QuizPage userName={user.name} />
      </div>
    </main>
  );
}
