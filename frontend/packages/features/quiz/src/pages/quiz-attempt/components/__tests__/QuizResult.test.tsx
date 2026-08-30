import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { QuizAttempt } from "../../../../models/types";
import { QuizResult } from "../QuizResult";

vi.mock("next/link", () => ({
  default: ({ href, children }: { href: string; children: ReactNode }) => (
    <a href={href}>{children}</a>
  ),
}));

function makeResult(overrides: Partial<QuizAttempt> = {}): QuizAttempt {
  return {
    id: 1,
    quiz_id: 1,
    quiz_title: "Animal Quiz",
    started_at: "2026-01-01T00:00:00Z",
    completed_at: "2026-01-01T00:05:00Z",
    ai_feedback: "You are a fox!",
    answers: [],
    ...overrides,
  };
}

describe("QuizResult", () => {
  it("shows a loading indicator while generating the result", () => {
    render(
      <QuizResult
        isLoading
        result={null}
        completeError={null}
        onRetry={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Generating your personalized result..."),
    ).toBeInTheDocument();
  });

  it("shows the error and retries when 'Try again' is clicked", async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <QuizResult
        isLoading={false}
        result={null}
        completeError="Something went wrong"
        onRetry={onRetry}
      />,
    );

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Try again" }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  it("shows the ai feedback when present", () => {
    render(
      <QuizResult
        isLoading={false}
        result={makeResult({ ai_feedback: "You are a fox!" })}
        completeError={null}
        onRetry={vi.fn()}
      />,
    );

    expect(screen.getByText("You are a fox!")).toBeInTheDocument();
  });

  it("shows a fallback message when there is a result but no ai feedback", () => {
    render(
      <QuizResult
        isLoading={false}
        result={makeResult({ ai_feedback: null })}
        completeError={null}
        onRetry={vi.fn()}
      />,
    );

    expect(
      screen.getByText("Quiz failed to generate a personalized answer."),
    ).toBeInTheDocument();
  });

  it("renders each answer's question and choice text", () => {
    render(
      <QuizResult
        isLoading={false}
        result={makeResult({
          answers: [
            {
              id: 1,
              question_id: 1,
              question_text: "What is your favorite color?",
              choice_id: 1,
              choice_text: "Blue",
              time_spent_ms: 1000,
            },
          ],
        })}
        completeError={null}
        onRetry={vi.fn()}
      />,
    );

    expect(
      screen.getByText("What is your favorite color?"),
    ).toBeInTheDocument();
    expect(screen.getByText("Blue")).toBeInTheDocument();
  });

  it("links back to the quizzes list", () => {
    render(
      <QuizResult
        isLoading={false}
        result={makeResult()}
        completeError={null}
        onRetry={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("link", { name: "Back to quizzes" }),
    ).toHaveAttribute("href", "/");
  });
});
