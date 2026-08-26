import { redirect } from "next/navigation";
import { LoginForm } from "@/components/auth/LoginForm";
import { getServerUser } from "@/lib/auth/session";

export default async function LoginPage() {
  const user = await getServerUser();
  if (user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-center text-2xl font-semibold">Log in</h1>
        <LoginForm />
      </div>
    </main>
  );
}
