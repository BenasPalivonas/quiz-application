import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import {
  QuizStoreContext,
  createQuizStore,
  emptyQuestion,
} from "../../../../stores/quiz-store";
import { QuizTitleStep } from "../QuizTitleStep";

function renderWithStore(initialTitle = "") {
  const store = createQuizStore(initialTitle, [emptyQuestion()]);
  const setEditQuestionsStep = vi.fn();
  render(
    <QuizStoreContext.Provider value={store}>
      <QuizTitleStep setEditQuestionsStep={setEditQuestionsStep} />
    </QuizStoreContext.Provider>,
  );
  return { store, setEditQuestionsStep };
}

describe("QuizTitleStep", () => {
  it("updates the displayed title as the user types", async () => {
    const user = userEvent.setup();
    renderWithStore();

    const input = screen.getByLabelText("Quiz title");
    await user.type(input, "What Animal Are You?");

    expect(input).toHaveValue("What Animal Are You?");
  });

  it("shows an error and does not continue when the title is blank", async () => {
    const user = userEvent.setup();
    const { setEditQuestionsStep } = renderWithStore("   ");

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Title is required")).toBeInTheDocument();
    expect(setEditQuestionsStep).not.toHaveBeenCalled();
  });

  it("continues to the next step when a title is provided", async () => {
    const user = userEvent.setup();
    const { setEditQuestionsStep } = renderWithStore();

    await user.type(screen.getByLabelText("Quiz title"), "My quiz");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(setEditQuestionsStep).toHaveBeenCalledTimes(1);
  });
});
