import { LogoutButton } from "@repo/auth/components/LogoutButton";
import { getServerUser } from "@repo/auth/session";
import { Button } from "@repo/ui/button";
import { QuizPage } from "@repo/quiz/components/QuizPage";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col">
      <nav className="relative flex w-full items-center justify-end px-4 py-4">
        <Link
          href="/quizzes/create"
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Button type="button">Create quiz</Button>
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/quizzes/mine">
            <Button type="button" variant="secondary">
              My quizzes
            </Button>
          </Link>
          <LogoutButton />
        </div>
      </nav>
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-4">
        <QuizPage userName={user.name} />
      </div>
    </main>
  );
}
