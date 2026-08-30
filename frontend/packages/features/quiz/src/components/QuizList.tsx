import { Pagination } from "@repo/ui/pagination";
import type { ReactElement } from "react";
import type { PaginationMeta, Quiz } from "../models/types";
import { StartQuizButton } from "./StartQuizButton";

export function QuizList({
  quizzes,
  paginationData,
}: {
  quizzes: Quiz[];
  paginationData: PaginationMeta;
}): ReactElement {
  if (quizzes.length === 0) {
    return (
      <p className="text-sm text-white">
        No quizzes yet. Be the first to create one.
      </p>
    );
  }

  return (
    <div className="flex w-full max-w-2xl flex-col gap-6">
      <strong>Here is a list of quizzes waitting for you:</strong>
      <ul className="flex flex-col gap-3">
        {quizzes.map((quiz) => (
          <li
            key={quiz.id}
            className="flex items-center justify-between rounded-md border border-border/20 px-4 py-3"
          >
            <div className="flex flex-col">
              <span className="font-medium">{quiz.title}</span>
              <span className="text-sm text-white/60">
                by {quiz.user_name ?? "Unknown"}
              </span>
            </div>
            <StartQuizButton quizId={quiz.id} />
          </li>
        ))}
      </ul>
      <Pagination paginationData={paginationData} />
    </div>
  );
}
