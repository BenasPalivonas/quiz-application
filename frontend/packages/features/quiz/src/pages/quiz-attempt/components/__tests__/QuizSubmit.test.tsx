import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Quiz, QuizAttempt } from "../../../../models/types";
import { QuizSubmit } from "../QuizSubmit";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: (): { push: typeof mockPush } => ({ push: mockPush }),
}));

const { clientSubmitQuizAnswer } = vi.hoisted(() => ({
  clientSubmitQuizAnswer: vi.fn(),
}));

vi.mock("../../../../api/client-api", () => ({
  clientSubmitQuizAnswer,
}));

function makeQuiz(): Quiz {
  return {
    id: 1,
    title: "Animal Quiz",
    user_id: 1,
    is_owner: false,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    questions: [
      {
        id: 101,
        text: "First question?",
        choices: [
          { id: 201, text: "First choice" },
          { id: 202, text: "Second choice" },
        ],
      },
      {
        id: 102,
        text: "Second question?",
        choices: [
          { id: 203, text: "Third choice" },
          { id: 204, text: "Fourth choice" },
        ],
      },
    ],
  };
}

function makeSingleQuestionQuiz(): Quiz {
  return {
    id: 2,
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

function makeAttempt(overrides: Partial<QuizAttempt> = {}): QuizAttempt {
  return {
    id: 1,
    quiz_id: 1,
    quiz_title: "Animal Quiz",
    started_at: "2026-01-01T00:00:00Z",
    completed_at: null,
    ai_feedback: null,
    answers: [],
    ...overrides,
  };
}

function makeAnswer(
  questionId: number,
  choiceId: number,
  choiceText: string,
): QuizAttempt["answers"][number] {
  return {
    id: questionId,
    question_id: questionId,
    question_text: "Question",
    choice_id: choiceId,
    choice_text: choiceText,
    time_spent_ms: 1000,
  };
}

describe("QuizSubmit", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the first unanswered question and its choices", () => {
    render(
      <QuizSubmit quiz={makeQuiz()} attempt={makeAttempt()} onComplete={vi.fn()} />,
    );

    expect(screen.getByText("Question 1 of 2")).toBeInTheDocument();
    expect(screen.getByText("First question?")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "First choice" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Second choice" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Next" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Finish" }),
    ).not.toBeInTheDocument();
  });

  it("submits the answer and advances to the next question", async () => {
    const user = userEvent.setup();
    clientSubmitQuizAnswer.mockResolvedValue(undefined);

    render(
      <QuizSubmit quiz={makeQuiz()} attempt={makeAttempt()} onComplete={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "First choice" }));

    await waitFor(() => {
      expect(clientSubmitQuizAnswer).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ question_id: 101, choice_id: 201 }),
      );
    });
    expect(await screen.findByText("Second question?")).toBeInTheDocument();
  });

  it("calls onComplete instead of advancing on the last question", async () => {
    const user = userEvent.setup();
    clientSubmitQuizAnswer.mockResolvedValue(undefined);
    const onComplete = vi.fn().mockResolvedValue(undefined);

    render(
      <QuizSubmit
        quiz={makeSingleQuestionQuiz()}
        attempt={makeAttempt({ quiz_id: 2 })}
        onComplete={onComplete}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Only choice" }));

    await waitFor(() => {
      expect(onComplete).toHaveBeenCalledTimes(1);
    });
  });

  it("navigates home on Back at the first question, and back a question after advancing", async () => {
    const user = userEvent.setup();
    clientSubmitQuizAnswer.mockResolvedValue(undefined);

    render(
      <QuizSubmit quiz={makeQuiz()} attempt={makeAttempt()} onComplete={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(mockPush).toHaveBeenCalledWith("/");

    await user.click(screen.getByRole("button", { name: "First choice" }));
    expect(await screen.findByText("Second question?")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Back" }));
    expect(await screen.findByText("First question?")).toBeInTheDocument();
  });

  it("shows an error and stays on the same question when submitting fails", async () => {
    const user = userEvent.setup();
    clientSubmitQuizAnswer.mockRejectedValue(new Error("network error"));

    render(
      <QuizSubmit quiz={makeQuiz()} attempt={makeAttempt()} onComplete={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "First choice" }));

    expect(
      await screen.findByText("Couldn't submit your answer. Please try again."),
    ).toBeInTheDocument();
    expect(screen.getByText("First question?")).toBeInTheDocument();
  });

  it("starts at the first unanswered question when the attempt is in progress", () => {
    render(
      <QuizSubmit
        quiz={makeQuiz()}
        attempt={makeAttempt({
          answers: [makeAnswer(101, 201, "First choice")],
        })}
        onComplete={vi.fn()}
      />,
    );

    expect(screen.getByText("Question 2 of 2")).toBeInTheDocument();
    expect(screen.getByText("Second question?")).toBeInTheDocument();
  });

  it("keeps the selected choice after going back and Next returns without submitting again", async () => {
    const user = userEvent.setup();
    clientSubmitQuizAnswer.mockResolvedValue(undefined);

    render(
      <QuizSubmit quiz={makeQuiz()} attempt={makeAttempt()} onComplete={vi.fn()} />,
    );

    await user.click(screen.getByRole("button", { name: "First choice" }));
    expect(await screen.findByText("Second question?")).toBeInTheDocument();
    expect(clientSubmitQuizAnswer).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole("button", { name: "Back" }));

    expect(screen.getByText("First question?")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Next" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next" }));

    expect(screen.getByText("Second question?")).toBeInTheDocument();
    expect(clientSubmitQuizAnswer).toHaveBeenCalledTimes(1);
  });

  it("shows Finish when every question is already answered and completes without submitting again", async () => {
    const user = userEvent.setup();
    const onComplete = vi.fn().mockResolvedValue(undefined);

    render(
      <QuizSubmit
        quiz={makeQuiz()}
        attempt={makeAttempt({
          answers: [
            makeAnswer(101, 201, "First choice"),
            makeAnswer(102, 203, "Third choice"),
          ],
        })}
        onComplete={onComplete}
      />,
    );

    expect(screen.getByText("Second question?")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Finish" }));

    expect(onComplete).toHaveBeenCalledTimes(1);
    expect(clientSubmitQuizAnswer).not.toHaveBeenCalled();
  });
});
