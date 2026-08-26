import { getServerUser } from "@repo/auth/session";
import { CreateQuizForm } from "@repo/quiz/components/CreateQuizForm";
import { redirect } from "next/navigation";

export default async function CreateQuizPage() {
  const user = await getServerUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen flex-col items-center px-4 py-10">
      <div className="flex w-full max-w-xl flex-col gap-6">
        <h1 className="text-center text-2xl font-semibold">Create a quiz</h1>
        <CreateQuizForm />
      </div>
    </main>
  );
}
