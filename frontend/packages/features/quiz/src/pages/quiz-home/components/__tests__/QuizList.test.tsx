import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PaginationMeta, Quiz } from "../../../../models/types";
import { QuizList } from "../QuizList";

vi.mock("next/navigation", () => ({
  useRouter: (): { push: ReturnType<typeof vi.fn> } => ({ push: vi.fn() }),
  usePathname: (): string => "/",
}));

function makeQuiz(overrides: Partial<Quiz> = {}): Quiz {
  return {
    id: 1,
    title: "Animal Quiz",
    user_id: 1,
    is_owner: false,
    user_name: "Alice",
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
    ...overrides,
  };
}

function makePagination(overrides: Partial<PaginationMeta> = {}): PaginationMeta {
  return {
    current_page: 1,
    last_page: 1,
    per_page: 10,
    total: 1,
    ...overrides,
  };
}

describe("QuizList", () => {
  it("shows an empty-state message when there are no quizzes", () => {
    render(<QuizList quizzes={[]} paginationData={makePagination()} />);

    expect(
      screen.getByText("No quizzes yet. Be the first to create one."),
    ).toBeInTheDocument();
  });

  it("renders each quiz's title and author", () => {
    render(
      <QuizList
        quizzes={[makeQuiz({ user_name: "Alice" })]}
        paginationData={makePagination()}
      />,
    );

    expect(screen.getByText("Animal Quiz")).toBeInTheDocument();
    expect(screen.getByText("by Alice")).toBeInTheDocument();
  });

  it('falls back to "by Unknown" when there is no user_name', () => {
    render(
      <QuizList
        quizzes={[makeQuiz({ user_name: undefined })]}
        paginationData={makePagination()}
      />,
    );

    expect(screen.getByText("by Unknown")).toBeInTheDocument();
  });

  it("renders a Start Quiz button for each quiz", () => {
    render(
      <QuizList
        quizzes={[makeQuiz({ id: 1 }), makeQuiz({ id: 2 })]}
        paginationData={makePagination()}
      />,
    );

    expect(
      screen.getAllByRole("button", { name: "Start Quiz" }),
    ).toHaveLength(2);
  });

  it("renders pagination when there is more than one page", () => {
    render(
      <QuizList
        quizzes={[makeQuiz()]}
        paginationData={makePagination({ current_page: 2, last_page: 4 })}
      />,
    );

    expect(screen.getByText("Page 2 of 4")).toBeInTheDocument();
  });

  it("does not render pagination when there is only one page", () => {
    render(
      <QuizList
        quizzes={[makeQuiz()]}
        paginationData={makePagination({ last_page: 1 })}
      />,
    );

    expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument();
  });
});
