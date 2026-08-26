import Link from "next/link";
import type { PaginationMeta, Quiz } from "../types";

export function MyQuizzesList({
  quizzes,
  paginationData,
}: {
  quizzes: Quiz[];
  paginationData: PaginationMeta;
}) {
  if (quizzes.length === 0) {
    return (
      <p className="text-sm text-white">You haven't created any quizzes yet.</p>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <ul className="flex flex-col gap-3">
        {quizzes.map((quiz) => (
          <li
            key={quiz.id}
            className="flex items-center justify-between rounded-md border border-white/20 px-4 py-3"
          >
            <span className="font-medium">{quiz.title}</span>
            <span className="text-sm text-white">
              {quiz.questions_count ?? 0} question
              {quiz.questions_count === 1 ? "" : "s"}
            </span>
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
    </div>
  );
}
