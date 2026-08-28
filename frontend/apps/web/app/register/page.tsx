import { getServerUser } from "@repo/auth/session";
import { RegisterPage } from "@repo/auth/pages/RegisterPage";
import { redirect } from "next/navigation";
import type { ReactElement } from "react";

export default async function Page(): Promise<ReactElement> {
  const user = await getServerUser();
  if (user) {
    redirect("/");
  }

  return (
    <main>
      <RegisterPage />
    </main>
  );
}
