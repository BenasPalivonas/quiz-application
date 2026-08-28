import { getServerUser } from "@repo/auth/session";
import { EditQuizPage } from "@repo/quiz/pages/EditQuizPage";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

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
      <EditQuizPage id={id} />
    </main>
  );
}
