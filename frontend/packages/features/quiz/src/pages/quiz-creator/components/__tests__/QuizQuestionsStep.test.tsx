import { ApiError } from "@repo/api/http";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { Quiz } from "../../../../models/types";
import {
  QuizStoreContext,
  createQuizStore,
} from "../../../../stores/quiz-store";
import { QuizQuestionsStep } from "../QuizQuestionsStep";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
}));

const { clientCreateQuiz, clientUpdateQuiz } = vi.hoisted(() => ({
  clientCreateQuiz: vi.fn(),
  clientUpdateQuiz: vi.fn(),
}));

vi.mock("../../../../api/client-api", () => ({
  clientCreateQuiz,
  clientUpdateQuiz,
}));

function makeQuiz(): Quiz {
  return {
    id: 5,
    title: "Existing quiz",
    user_id: 1,
    is_owner: true,
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
}

function renderWithStore(quiz?: Quiz) {
  const store = createQuizStore("My quiz", [
    { text: "Question one", choices: [{ text: "A" }, { text: "B" }] },
    { text: "Question two", choices: [{ text: "C" }, { text: "D" }] },
  ]);
  const setEditTitleStep = vi.fn();
  render(
    <QuizStoreContext.Provider value={store}>
      <QuizQuestionsStep quiz={quiz} setEditTitleStep={setEditTitleStep} />
    </QuizStoreContext.Provider>,
  );
  return { store, setEditTitleStep };
}

describe("QuizQuestionsStep", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("renders the current question with its position", () => {
    renderWithStore();

    expect(screen.getByText("Question 1/2")).toBeInTheDocument();
    expect(screen.getByLabelText("Question 1")).toHaveValue("Question one");
  });

  it("navigates between questions with Next and Previous", async () => {
    const user = userEvent.setup();
    renderWithStore();

    expect(screen.getByRole("button", { name: "Previous" })).toBeDisabled();

    await user.click(screen.getByRole("button", { name: "Next" }));
    expect(screen.getByText("Question 2/2")).toBeInTheDocument();
    expect(screen.getByLabelText("Question 2")).toHaveValue("Question two");

    await user.click(screen.getByRole("button", { name: "Previous" }));
    expect(screen.getByText("Question 1/2")).toBeInTheDocument();
  });

  it("adds a question and navigates to it", async () => {
    const user = userEvent.setup();
    renderWithStore();

    await user.click(screen.getByRole("button", { name: "Add question" }));

    expect(screen.getByText("Question 3/3")).toBeInTheDocument();
  });

  it("submits the quiz and navigates home on success", async () => {
    const user = userEvent.setup();
    clientCreateQuiz.mockResolvedValue({ data: { id: 1 } });
    const { store } = renderWithStore();

    await user.click(screen.getByRole("button", { name: "Create quiz" }));

    await waitFor(() => {
      expect(clientCreateQuiz).toHaveBeenCalledWith({
        title: store.getState().title,
        questions: store.getState().questions,
      });
    });
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows a toast when submission fails with question field errors", async () => {
    const user = userEvent.setup();
    clientCreateQuiz.mockRejectedValue(
      new ApiError(422, "Validation failed", {
        "questions.0.text": ["Question text is required"],
      }),
    );
    renderWithStore();

    await user.click(screen.getByRole("button", { name: "Create quiz" }));

    expect(
      await screen.findByText(
        "Some questions or choices are missing information. Please review every question before creating the quiz.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByText("Question text is required")).toBeInTheDocument();
  });

  it("saves changes and navigates to my quizzes when editing", async () => {
    const user = userEvent.setup();
    clientUpdateQuiz.mockResolvedValue({ data: { id: 5 } });
    const { store } = renderWithStore(makeQuiz());

    await user.click(screen.getByRole("button", { name: "Save changes" }));

    await waitFor(() => {
      expect(clientUpdateQuiz).toHaveBeenCalledWith(5, {
        title: store.getState().title,
        questions: store.getState().questions,
      });
    });
    expect(mockPush).toHaveBeenCalledWith("/quizzes/mine");
    expect(clientCreateQuiz).not.toHaveBeenCalled();
  });

  it("shows a toast when submission fails without field errors", async () => {
    const user = userEvent.setup();
    clientCreateQuiz.mockRejectedValue(new Error("network error"));
    renderWithStore();

    await user.click(screen.getByRole("button", { name: "Create quiz" }));

    expect(
      await screen.findByText("Something went wrong. Please try again."),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });
});
