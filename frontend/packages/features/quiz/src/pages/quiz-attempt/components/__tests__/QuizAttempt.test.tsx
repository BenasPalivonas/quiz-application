import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Quiz, QuizAttempt as QuizAttemptType } from "../../../../models/types";
import { QuizAttempt } from "../QuizAttempt";

vi.mock("next/navigation", () => ({
  useRouter: (): { push: ReturnType<typeof vi.fn> } => ({ push: vi.fn() }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: ReactNode;
  }): ReactElement => <a href={href}>{children}</a>,
}));

const { clientSubmitQuizAnswer, clientCompleteQuizAttempt } = vi.hoisted(() => ({
  clientSubmitQuizAnswer: vi.fn(),
  clientCompleteQuizAttempt: vi.fn(),
}));

vi.mock("../../../../api/client-api", () => ({
  clientSubmitQuizAnswer,
  clientCompleteQuizAttempt,
}));

function makeQuiz(): Quiz {
  return {
    id: 1,
    title: "Short Quiz",
    user_id: 1,
    is_owner: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    questions: [
      {
        id: 301,
        text: "Only question?",
        choices: [{ id: 401, text: "Only choice" }],
      },
    ],
  };
}

function makeAttempt(overrides: Partial<QuizAttemptType> = {}): QuizAttemptType {
  return {
    id: 1,
    quiz_id: 1,
    quiz_title: "Short Quiz",
    started_at: "2026-01-01T00:00:00Z",
    completed_at: null,
    ai_feedback: null,
    answers: [],
    ...overrides,
  };
}

describe("QuizAttempt", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the answer flow when the attempt is not yet completed", () => {
    render(<QuizAttempt quiz={makeQuiz()} attempt={makeAttempt()} />);

    expect(screen.getByText("Only question?")).toBeInTheDocument();
  });

  it("renders the result immediately when the attempt is already completed", () => {
    render(
      <QuizAttempt
        quiz={makeQuiz()}
        attempt={makeAttempt({
          completed_at: "2026-01-01T00:05:00Z",
          ai_feedback: "You are a fox!",
        })}
      />,
    );

    expect(screen.getByText("You are a fox!")).toBeInTheDocument();
    expect(screen.queryByText("Only question?")).not.toBeInTheDocument();
  });

  it("completes the attempt and shows the result after answering the last question", async () => {
    const user = userEvent.setup();
    clientSubmitQuizAnswer.mockResolvedValue(undefined);
    clientCompleteQuizAttempt.mockResolvedValue({
      data: makeAttempt({
        completed_at: "2026-01-01T00:05:00Z",
        ai_feedback: "You are a fox!",
      }),
    });

    render(<QuizAttempt quiz={makeQuiz()} attempt={makeAttempt()} />);

    await user.click(screen.getByRole("button", { name: "Only choice" }));

    await waitFor(() => {
      expect(clientSubmitQuizAnswer).toHaveBeenCalledTimes(1);
    });
    await waitFor(() => {
      expect(clientCompleteQuizAttempt).toHaveBeenCalledWith(1);
    });
    expect(await screen.findByText("You are a fox!")).toBeInTheDocument();
  });

  it("shows an error and retries generating the result when completing fails", async () => {
    const user = userEvent.setup();
    clientSubmitQuizAnswer.mockResolvedValue(undefined);
    clientCompleteQuizAttempt
      .mockRejectedValueOnce(new Error("failed"))
      .mockResolvedValueOnce({
        data: makeAttempt({
          completed_at: "2026-01-01T00:05:00Z",
          ai_feedback: "You are a fox!",
        }),
      });

    render(<QuizAttempt quiz={makeQuiz()} attempt={makeAttempt()} />);

    await user.click(screen.getByRole("button", { name: "Only choice" }));

    expect(
      await screen.findByText(
        "Something went wrong while generating your result. Please try again.",
      ),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Try again" }));

    expect(await screen.findByText("You are a fox!")).toBeInTheDocument();
  });
});
