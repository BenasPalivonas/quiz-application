"use client";

import { Button } from "@repo/ui/button";
import { Skeleton } from "@repo/ui/skeleton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactElement } from "react";
import {
  clientCompleteQuizAttempt,
  clientSubmitQuizAnswer,
} from "../client-api";
import { elapsedMsSince, nowMs } from "../time";
import type { Quiz, QuizAttempt } from "../types";

type Phase = "taking" | "loading-result" | "result";

export function QuizSubmit({
  quiz,
  attempt,
}: {
  quiz: Quiz;
  attempt: QuizAttempt;
}): ReactElement | null {
  const router = useRouter();
  const attemptId = attempt.id;
  const questions = quiz.questions ?? [];
  const isAlreadyCompleted = attempt.completed_at !== null;

  const [currentIndex, setCurrentIndex] = useState(() => {
    const firstUnansweredIndex = questions.findIndex(
      (question) =>
        !attempt.answers.some((answer) => answer.question_id === question.id),
    );
    if (firstUnansweredIndex === -1) {
      return Math.max(questions.length - 1, 0);
    }
    return firstUnansweredIndex;
  });
  const [phase, setPhase] = useState<Phase>(
    isAlreadyCompleted ? "result" : "taking",
  );
  const [submittingChoiceId, setSubmittingChoiceId] = useState<number | null>(
    null,
  );
  const [answerError, setAnswerError] = useState<string | null>(null);
  const [completeError, setCompleteError] = useState<string | null>(null);
  const [result, setResult] = useState<QuizAttempt | null>(
    isAlreadyCompleted ? attempt : null,
  );
  const [answeredChoices, setAnsweredChoices] = useState<
    Record<number, number>
  >(() =>
    Object.fromEntries(
      attempt.answers.map((answer) => [answer.question_id, answer.choice_id]),
    ),
  );
  const startTimeRef = useRef(0);

  const currentQuestion = questions[currentIndex];
  const isLastQuestion = currentIndex === questions.length - 1;
  const selectedChoiceId = currentQuestion
    ? (answeredChoices[currentQuestion.id] ?? null)
    : null;
  const isCurrentAnswered = selectedChoiceId !== null;

  useEffect(() => {
    startTimeRef.current = nowMs();
  }, [currentIndex]);

  async function runComplete(): Promise<void> {
    setCompleteError(null);
    setPhase("loading-result");
    try {
      const { data } = await clientCompleteQuizAttempt(attemptId);
      setResult(data);
      setPhase("result");
    } catch {
      setCompleteError(
        "Something went wrong while generating your result. Please try again.",
      );
      setPhase("result");
    }
  }

  async function handleChoiceSelect(choiceId: number): Promise<void> {
    if (submittingChoiceId !== null || !currentQuestion) {
      return;
    }

    setAnswerError(null);
    setSubmittingChoiceId(choiceId);
    const timeSpentMs = elapsedMsSince(startTimeRef.current);

    try {
      await clientSubmitQuizAnswer(attemptId, {
        question_id: currentQuestion.id,
        choice_id: choiceId,
        time_spent_ms: timeSpentMs,
      });

      setAnsweredChoices((prev) => ({
        ...prev,
        [currentQuestion.id]: choiceId,
      }));

      if (isLastQuestion) {
        await runComplete();
      } else {
        setCurrentIndex((index) => index + 1);
      }
    } catch {
      setAnswerError("Couldn't submit your answer. Please try again.");
    } finally {
      setSubmittingChoiceId(null);
    }
  }

  function handleBack(): void {
    if (currentIndex === 0) {
      router.push("/");
      return;
    }
    setAnswerError(null);
    setCurrentIndex((index) => index - 1);
  }

  function handleNext(): void {
    if (!isCurrentAnswered || isLastQuestion) {
      return;
    }
    setAnswerError(null);
    setCurrentIndex((index) => index + 1);
  }

  if (phase === "loading-result") {
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

  if (phase === "result") {
    return (
      <div className="flex flex-col gap-6">
        {completeError ? (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-red-400">{completeError}</p>
            <Button type="button" onClick={runComplete}>
              Try again
            </Button>
          </div>
        ) : result?.ai_feedback ? (
          <div className="flex flex-col gap-2 rounded-md border border-white/20 px-4 py-4">
            <h2 className="text-lg font-semibold">Your result</h2>
            <p className="whitespace-pre-line text-sm">{result.ai_feedback}</p>
          </div>
        ) : (
          <p className="text-sm text-red-400">
            Quiz failed to generate a personalized answer.
          </p>
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

  if (!currentQuestion) {
    return null;
  }

  return (
    <div className="flex flex-col gap-6">
      <p className="text-sm text-white/60">
        Question {currentIndex + 1} of {questions.length}
      </p>
      <h2 className="text-xl font-semibold">{currentQuestion.text}</h2>
      <div className="flex flex-col gap-3">
        {currentQuestion.choices.map((choice) => {
          const isSelected = choice.id === selectedChoiceId;

          return (
            <Button
              key={choice.id}
              type="button"
              variant="secondary"
              className={`w-full text-left ${
                isSelected ? "ring-2 ring-blue-500" : ""
              }`}
              disabled={submittingChoiceId !== null}
              onClick={() => handleChoiceSelect(choice.id)}
            >
              {choice.text}
            </Button>
          );
        })}
      </div>
      {answerError && <p className="text-sm text-red-400">{answerError}</p>}
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="secondary"
          disabled={submittingChoiceId !== null}
          onClick={handleBack}
        >
          Back
        </Button>
        {isCurrentAnswered && !isLastQuestion && (
          <Button
            type="button"
            variant="primary"
            disabled={submittingChoiceId !== null}
            onClick={handleNext}
          >
            Next
          </Button>
        )}
        {isCurrentAnswered && isLastQuestion && (
          <Button
            type="button"
            variant="primary"
            disabled={submittingChoiceId !== null}
            onClick={runComplete}
          >
            Finish
          </Button>
        )}
      </div>
    </div>
  );
}
