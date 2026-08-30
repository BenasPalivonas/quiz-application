"use client";

import { useRef, useState, type ReactElement } from "react";
import { clientCompleteQuizAttempt } from "../api/client-api";
import type { Quiz, QuizAttempt } from "../models/types";
import { QuizResult } from "./QuizResult";
import { QuizSubmit } from "./QuizSubmit";

export function QuizAttempt({
  quiz,
  attempt,
}: {
  quiz: Quiz;
  attempt: QuizAttempt;
}): ReactElement {
  const [isQuizCompleted, setIsQuizCompleted] = useState(
    attempt.completed_at !== null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizAttempt | null>(
    attempt.completed_at !== null ? attempt : null,
  );
  const isCompletingRef = useRef(false);

  async function runComplete(): Promise<void> {
    if (isCompletingRef.current) {
      return;
    }
    isCompletingRef.current = true;
    setCompleteError(null);
    setIsQuizCompleted(true);
    setIsLoading(true);
    try {
      const { data } = await clientCompleteQuizAttempt(attempt.id);
      setResult(data);
    } catch {
      setCompleteError(
        "Something went wrong while generating your result. Please try again.",
      );
    }
    setIsLoading(false);
    isCompletingRef.current = false;
  }

  if (!isQuizCompleted) {
    return (
      <QuizSubmit quiz={quiz} attempt={attempt} onComplete={runComplete} />
    );
  }

  return (
    <QuizResult
      isLoading={isLoading}
      result={result}
      completeError={completeError}
      onRetry={runComplete}
    />
  );
}
