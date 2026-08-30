import { getServerUser } from "@repo/auth/session";
import { MyAttemptsPage } from "@repo/quiz/pages/my-attempts/MyAttemptsPage";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";
import { Navbar } from "../components/Navbar";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}): Promise<ReactElement> {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  const { page } = await searchParams;

  return (
    <main>
      <Navbar />
      <MyAttemptsPage page={page} />
    </main>
  );
}
