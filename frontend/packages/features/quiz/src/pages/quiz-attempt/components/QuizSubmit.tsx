"use client";

import { Button } from "@repo/ui/button";
import { ErrorText } from "@repo/ui/error-text";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactElement } from "react";
import { clientSubmitQuizAnswer } from "../../../api/client-api";
import type { Quiz, QuizAttempt } from "../../../models/types";
import { elapsedMsSince, nowMs } from "../../../utils/time";

export function QuizSubmit({
  quiz,
  attempt,
  onComplete,
}: {
  quiz: Quiz;
  attempt: QuizAttempt;
  onComplete: () => Promise<void>;
}): ReactElement | null {
  const router = useRouter();
  const attemptId = attempt.id;
  const questions = quiz.questions ?? [];

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
  const [submittingChoiceId, setSubmittingChoiceId] = useState<number | null>(
    null,
  );
  const [answerError, setAnswerError] = useState<string | null>(null);
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
        await onComplete();
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
      {answerError && <ErrorText>{answerError}</ErrorText>}
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
            onClick={onComplete}
          >
            Finish
          </Button>
        )}
      </div>
    </div>
  );
}
