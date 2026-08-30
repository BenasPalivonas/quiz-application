import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import type { Quiz } from "../../../../models/types";
import { QuizForm } from "../QuizForm";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
}));

describe("QuizForm", () => {
  it("starts on the title step", () => {
    render(<QuizForm />);

    expect(screen.getByLabelText("Quiz title")).toBeInTheDocument();
  });

  it("moves to the questions step after entering a title and continuing", async () => {
    const user = userEvent.setup();
    render(<QuizForm />);

    await user.type(screen.getByLabelText("Quiz title"), "My quiz");
    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByText("Question 1/1")).toBeInTheDocument();
    expect(screen.queryByLabelText("Quiz title")).not.toBeInTheDocument();
  });

  it("goes back to the title step from the questions step", async () => {
    const user = userEvent.setup();
    render(<QuizForm />);

    await user.type(screen.getByLabelText("Quiz title"), "My quiz");
    await user.click(screen.getByRole("button", { name: "Continue" }));
    await user.click(screen.getByRole("button", { name: "Edit title" }));

    expect(screen.getByLabelText("Quiz title")).toHaveValue("My quiz");
  });

  it("pre-fills the title and questions from an existing quiz", async () => {
    const user = userEvent.setup();
    const quiz: Quiz = {
      id: 1,
      title: "Animal Quiz",
      user_id: 1,
      is_owner: true,
      created_at: "2026-01-01T00:00:00Z",
      updated_at: "2026-01-01T00:00:00Z",
      questions: [
        {
          id: 1,
          text: "What is your favorite color?",
          choices: [
            { id: 1, text: "Blue" },
            { id: 2, text: "Red" },
          ],
        },
      ],
    };

    render(<QuizForm quiz={quiz} />);

    expect(screen.getByLabelText("Quiz title")).toHaveValue("Animal Quiz");

    await user.click(screen.getByRole("button", { name: "Continue" }));

    expect(screen.getByLabelText("Question 1")).toHaveValue(
      "What is your favorite color?",
    );
    expect(screen.getByLabelText("Choice 1")).toHaveValue("Blue");
    expect(screen.getByLabelText("Choice 2")).toHaveValue("Red");
  });
});
