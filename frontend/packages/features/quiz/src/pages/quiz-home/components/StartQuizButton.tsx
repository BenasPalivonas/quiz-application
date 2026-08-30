"use client";

import { Button } from "@repo/ui/button";
import { Toast } from "@repo/ui/toast";
import { useRouter } from "next/navigation";
import { useState, type ReactElement } from "react";
import { clientStartQuizAttempt } from "../../../api/client-api";

export function StartQuizButton({ quizId }: { quizId: number }): ReactElement {
  const router = useRouter();
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleStart(): Promise<void> {
    setError(null);
    setIsStarting(true);

    try {
      const { data } = await clientStartQuizAttempt(quizId);
      router.push(`/quizzes/${quizId}/attempt/${data.id}`);
    } catch {
      setError("Couldn't start the quiz. Please try again.");
      setIsStarting(false);
    }
  }

  return (
    <>
      <Button type="button" onClick={handleStart} disabled={isStarting}>
        Start Quiz
      </Button>
      {error && <Toast message={error} onDismiss={() => setError(null)} />}
    </>
  );
}
