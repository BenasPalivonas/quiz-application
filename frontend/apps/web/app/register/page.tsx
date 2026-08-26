import { RegisterForm } from "@repo/auth/components/RegisterForm";
import { getServerUser } from "@repo/auth/session";
import { redirect } from "next/navigation";

export default async function RegisterPage() {
  const user = await getServerUser();
  if (user) {
    redirect("/");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-center text-2xl font-semibold">
          Create an account
        </h1>
        <RegisterForm />
      </div>
    </main>
  );
}
