import { getServerUser } from "@repo/auth/session";
import { MyAttemptsPage } from "@repo/quiz/pages/MyAttemptsPage";
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
      <MyAttemptsPage page={page} />
    </main>
  );
}
