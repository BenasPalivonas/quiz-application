import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import type { StoreApi } from "zustand";
import { MAX_CHOICES } from "../../../../models/question-consts";
import {
  QuizStoreContext,
  createQuizStore,
  useQuizStore,
} from "../../../../stores/quiz-store";
import { QuestionEditorForm } from "../QuestionEditorForm";

type Store = ReturnType<typeof createQuizStore>;

function Harness({
  questionIndex = 0,
}: {
  questionIndex?: number;
}): ReturnType<typeof QuestionEditorForm> {
  const question = useQuizStore((state) => state.questions[questionIndex]!);
  return (
    <QuestionEditorForm
      question={question}
      questionIndex={questionIndex}
      fieldErrors={{}}
    />
  );
}

function renderWithStore(
  store: StoreApi<unknown> & Store,
  questionIndex = 0,
): ReturnType<typeof render> {
  return render(
    <QuizStoreContext.Provider value={store}>
      <Harness questionIndex={questionIndex} />
    </QuizStoreContext.Provider>,
  );
}

describe("QuestionEditorForm", () => {
  it("updates the displayed question text as the user types", async () => {
    const user = userEvent.setup();
    const store = createQuizStore("Quiz", [
      { text: "", choices: [{ text: "" }, { text: "" }] },
    ]);
    renderWithStore(store);

    const input = screen.getByLabelText("Question 1");
    await user.type(input, "What is your favorite color?");

    expect(input).toHaveValue("What is your favorite color?");
  });

  it("updates the displayed choice text as the user types", async () => {
    const user = userEvent.setup();
    const store = createQuizStore("Quiz", [
      { text: "Q", choices: [{ text: "" }, { text: "" }] },
    ]);
    renderWithStore(store);

    const input = screen.getByLabelText("Choice 1");
    await user.type(input, "Blue");

    expect(input).toHaveValue("Blue");
  });

  it("adds a new choice field when 'Add choice' is clicked", async () => {
    const user = userEvent.setup();
    const store = createQuizStore("Quiz", [
      { text: "Q", choices: [{ text: "A" }, { text: "B" }] },
    ]);
    renderWithStore(store);

    expect(screen.queryByLabelText("Choice 3")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Add choice" }));

    expect(screen.getByLabelText("Choice 3")).toBeInTheDocument();
  });

  it("removes a choice field when more than the minimum choices exist", async () => {
    const user = userEvent.setup();
    const store = createQuizStore("Quiz", [
      { text: "Q", choices: [{ text: "A" }, { text: "B" }, { text: "C" }] },
    ]);
    renderWithStore(store);

    const removeButtons = screen.getAllByRole("button", {
      name: "Remove choice",
    });
    await user.click(removeButtons[0]!);

    expect(screen.queryByLabelText("Choice 3")).not.toBeInTheDocument();
  });

  it("disables removing a choice at the minimum number of choices", () => {
    const store = createQuizStore("Quiz", [
      { text: "Q", choices: [{ text: "A" }, { text: "B" }] },
    ]);
    renderWithStore(store);

    for (const button of screen.getAllByRole("button", {
      name: "Remove choice",
    })) {
      expect(button).toBeDisabled();
    }
  });

  it("disables adding a choice at the maximum number of choices", () => {
    const store = createQuizStore("Quiz", [
      {
        text: "Q",
        choices: Array.from({ length: MAX_CHOICES }, (_, index) => ({
          text: `Choice ${index + 1}`,
        })),
      },
    ]);
    renderWithStore(store);

    expect(screen.getByRole("button", { name: "Add choice" })).toBeDisabled();
  });

  it("disables removing the question when it's the only one, and disables itself after removal", async () => {
    const user = userEvent.setup();
    const singleStore = createQuizStore("Quiz", [
      { text: "Q1", choices: [{ text: "A" }, { text: "B" }] },
    ]);
    const single = renderWithStore(singleStore);
    expect(
      single.getByRole("button", { name: "Remove question" }),
    ).toBeDisabled();
    single.unmount();

    const multiStore = createQuizStore("Quiz", [
      { text: "Q1", choices: [{ text: "A" }, { text: "B" }] },
      { text: "Q2", choices: [{ text: "A" }, { text: "B" }] },
    ]);
    const multi = renderWithStore(multiStore);
    const removeQuestionButton = multi.getByRole("button", {
      name: "Remove question",
    });
    expect(removeQuestionButton).toBeEnabled();

    await user.click(removeQuestionButton);

    expect(removeQuestionButton).toBeDisabled();
  });
});
