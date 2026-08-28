import { getServerUser } from "@repo/auth/session";
import { RegisterPage } from "@repo/auth/pages/RegisterPage";
import { redirect } from "next/navigation";

export default async function Page() {
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
