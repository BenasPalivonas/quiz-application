import { getServerUser } from "@repo/auth/session";
import { CreateQuizPage } from "@repo/quiz/pages/CreateQuizPage";
import { redirect } from "next/navigation";

export default async function Page() {
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
