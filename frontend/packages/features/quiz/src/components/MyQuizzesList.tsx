"use client";

import { Button } from "@repo/ui/button";
import { Toast } from "@repo/ui/toast";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { clientDeleteQuiz } from "../client-api";
import type { PaginationMeta, Quiz } from "../types";

export function MyQuizzesList({
  quizzes,
  paginationData,
}: {
  quizzes: Quiz[];
  paginationData: PaginationMeta;
}) {
  const router = useRouter();
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const visibleQuizzes = quizzes.filter((quiz) => !deletedIds.includes(quiz.id));

  async function handleDelete(quiz: Quiz) {
    if (!window.confirm(`Delete "${quiz.title}"? This can't be undone.`)) {
      return;
    }

    setErrorMessage(null);
    setDeletingId(quiz.id);

    try {
      await clientDeleteQuiz(quiz.id);
      setDeletedIds((ids) => [...ids, quiz.id]);
      router.refresh();
    } catch {
      setErrorMessage("Couldn't delete the quiz. Please try again.");
    } finally {
      setDeletingId(null);
    }
  }

  if (visibleQuizzes.length === 0) {
    return (
      <p className="text-sm text-white">You haven't created any quizzes yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {visibleQuizzes.map((quiz) => (
          <li
            key={quiz.id}
            className="flex items-center justify-between rounded-md border border-white/20 px-4 py-3"
          >
            <span className="font-medium">{quiz.title}</span>
            <div className="flex items-center gap-4">
              <span className="text-sm text-white">
                {quiz.questions_count ?? 0} question
                {quiz.questions_count === 1 ? "" : "s"}
              </span>
              <Button
                type="button"
                variant="secondary"
                onClick={() => handleDelete(quiz)}
                disabled={deletingId === quiz.id}
              >
                {deletingId === quiz.id ? "Deleting..." : "Delete"}
              </Button>
            </div>
          </li>
        ))}
      </ul>

      {paginationData.last_page > 1 && (
        <nav className="flex items-center justify-center gap-4 text-sm">
          {paginationData.current_page > 1 ? (
            <Link
              href={`/quizzes/mine?page=${paginationData.current_page - 1}`}
            >
              Previous
            </Link>
          ) : (
            <span className="text-white">Previous</span>
          )}
          <span className="text-white">
            Page {paginationData.current_page} of {paginationData.last_page}
          </span>
          {paginationData.current_page < paginationData.last_page ? (
            <Link
              href={`/quizzes/mine?page=${paginationData.current_page + 1}`}
            >
              Next
            </Link>
          ) : (
            <span className="text-white">Next</span>
          )}
        </nav>
      )}

      {errorMessage && (
        <Toast message={errorMessage} onDismiss={() => setErrorMessage(null)} />
      )}
    </div>
  );
}
