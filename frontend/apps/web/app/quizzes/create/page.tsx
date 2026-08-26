import { getServerUser } from "@repo/auth/session";
import { CreateQuizForm } from "@repo/quiz/components/CreateQuizForm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function CreateQuizPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create a quiz</h1>
          <Link href="/" className="text-sm text-white hover:text-white">
            Back
          </Link>
        </div>
        <CreateQuizForm />
      </div>
    </main>
  );
}
