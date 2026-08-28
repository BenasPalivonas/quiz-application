import { getServerUser } from "@repo/auth/session";
import { MyQuizzesPage } from "@repo/quiz/pages/MyQuizzesPage";
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
    <main>
      <MyQuizzesPage page={page} />
    </main>
  );
}
