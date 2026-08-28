import { getServerUser } from "@repo/auth/session";
import { LoginPage } from "@repo/auth/pages/LoginPage";
import { redirect } from "next/navigation";

export default async function Page() {
  const user = await getServerUser();
  if (user) {
    redirect("/");
  }

  return (
    <main>
      <LoginPage />
    </main>
  );
}
