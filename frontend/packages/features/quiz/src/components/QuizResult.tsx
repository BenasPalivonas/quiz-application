"use client";

import { Button } from "@repo/ui/button";
import { ErrorText } from "@repo/ui/error-text";
import { Skeleton } from "@repo/ui/skeleton";
import Link from "next/link";
import type { ReactElement } from "react";
import type { QuizAttempt } from "../types";

export function QuizResult({
  isLoading,
  result,
  completeError,
  onRetry,
}: {
  isLoading: boolean;
  result: QuizAttempt | null;
  completeError: string | null;
  onRetry: () => void;
}): ReactElement {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <p className="text-sm text-white/60">
          Generating your personalized result...
        </p>
        <div className="flex flex-col gap-3">
          <Skeleton className="h-[400px] w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {completeError ? (
        <div className="flex flex-col gap-3">
          <ErrorText>{completeError}</ErrorText>
          <Button type="button" onClick={onRetry}>
            Try again
          </Button>
        </div>
      ) : result?.ai_feedback ? (
        <div className="flex flex-col gap-2 rounded-md border border-border/20 px-4 py-4">
          <h2 className="text-lg font-semibold">Your result</h2>
          <p className="whitespace-pre-line text-sm">{result.ai_feedback}</p>
        </div>
      ) : (
        <ErrorText>Quiz failed to generate a personalized answer.</ErrorText>
      )}

      {result && result.answers.length > 0 && (
        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-semibold text-white/60">
            Your answers
          </h3>
          <ul className="flex flex-col gap-2">
            {result.answers.map((answer) => (
              <li
                key={answer.id}
                className="rounded-md border border-white/10 px-3 py-2 text-sm"
              >
                <p className="text-white/60">{answer.question_text}</p>
                <p>{answer.choice_text} </p>
              </li>
            ))}
          </ul>
        </div>
      )}

      <Link href="/" className="text-sm text-white hover:text-white">
        Back to quizzes
      </Link>
    </div>
  );
}
