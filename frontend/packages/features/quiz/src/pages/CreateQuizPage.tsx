import Link from "next/link";
import type { ReactElement } from "react";
import { QuizForm } from "../components/QuizForm";
import { QuizLayout } from "../layouts/QuizLayout";

export function CreateQuizPage(): ReactElement {
  return (
    <QuizLayout>
      <div className="flex flex-1 flex-col items-center px-4 py-10">
        <div className="flex w-full max-w-xl flex-col gap-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-semibold">Create a quiz</h1>
            <Link href="/" className="text-sm text-white hover:text-white">
              Back
            </Link>
          </div>
          <QuizForm />
        </div>
      </div>
    </QuizLayout>
  );
}
