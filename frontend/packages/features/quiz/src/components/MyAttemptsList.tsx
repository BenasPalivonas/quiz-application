import { Button } from "@repo/ui/button";
import Link from "next/link";
import type { ReactElement } from "react";
import type { PaginationMeta, QuizAttempt } from "../types";

export function MyAttemptsList({
  attempts,
  paginationData,
}: {
  attempts: QuizAttempt[];
  paginationData: PaginationMeta;
}): ReactElement {
  if (attempts.length === 0) {
    return (
      <p className="text-sm text-white">You haven't attempted any quizzes yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {attempts.map((attempt) => {
          const isCompleted = attempt.completed_at !== null;
          const totalQuestions = attempt.quiz_questions_count ?? 0;
          const answeredQuestions = attempt.answered_questions_count ?? 0;

          return (
            <li
              key={attempt.id}
              className="flex items-center justify-between rounded-md border border-white/20 px-4 py-3"
            >
              <div className="flex flex-col">
                <span className="font-medium">
                  {attempt.quiz_title ?? "Untitled quiz"}
                </span>
                <span className="text-sm text-white/60">
                  {isCompleted ? "Completed" : "In progress"} &middot;{" "}
                  {answeredQuestions}/{totalQuestions} answered
                </span>
              </div>
              <Link href={`/quizzes/${attempt.quiz_id}/attempt/${attempt.id}`}>
                <Button type="button" variant="secondary">
                  {isCompleted ? "View answers" : "Resume"}
                </Button>
              </Link>
            </li>
          );
        })}
      </ul>

      {paginationData.last_page > 1 && (
        <nav className="flex items-center justify-center gap-4 text-sm">
          {paginationData.current_page > 1 ? (
            <Link href={`/attempts?page=${paginationData.current_page - 1}`}>
              Previous
            </Link>
          ) : (
            <span className="text-white">Previous</span>
          )}
          <span className="text-white">
            Page {paginationData.current_page} of {paginationData.last_page}
          </span>
          {paginationData.current_page < paginationData.last_page ? (
            <Link href={`/attempts?page=${paginationData.current_page + 1}`}>
              Next
            </Link>
          ) : (
            <span className="text-white">Next</span>
          )}
        </nav>
      )}
    </div>
  );
}
