import { redirect } from "next/navigation";
import { QuizPage } from "@/components/home/QuizPage";
import { getServerUser } from "@/lib/auth/session";

export default async function Page() {
  const user = await getServerUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 px-4">
      <QuizPage user={user} />
    </main>
  );
}
