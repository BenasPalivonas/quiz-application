import { getServerUser } from "@repo/auth/session";
import { EditQuizPage } from "@repo/quiz/pages/EditQuizPage";
import { redirect } from "next/navigation";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <main>
      <EditQuizPage id={id} />
    </main>
  );
}
