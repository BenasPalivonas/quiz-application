import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import type { PaginationMeta, QuizAttempt } from "../../../../models/types";
import { MyAttemptsList } from "../MyAttemptsList";

vi.mock("next/navigation", () => ({
  usePathname: (): string => "/quizzes/mine/attempts",
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }): React.ReactElement => (
    <a href={String(href)} {...props}>
      {children}
    </a>
  ),
}));

function makeAttempt(overrides: Partial<QuizAttempt> = {}): QuizAttempt {
  return {
    id: 1,
    quiz_id: 10,
    quiz_title: "Animal Quiz",
    quiz_questions_count: 5,
    answered_questions_count: 2,
    started_at: "2026-01-01T00:00:00Z",
    completed_at: null,
    ai_feedback: null,
    answers: [],
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

describe("MyAttemptsList", () => {
  it("shows an empty-state message when there are no attempts", () => {
    render(
      <MyAttemptsList attempts={[]} paginationData={makePagination()} />,
    );

    expect(
      screen.getByText("You haven't attempted any quizzes yet."),
    ).toBeInTheDocument();
  });

  it("renders each attempt's title and answered/total count", () => {
    render(
      <MyAttemptsList
        attempts={[makeAttempt()]}
        paginationData={makePagination()}
      />,
    );

    expect(screen.getByText("Animal Quiz")).toBeInTheDocument();
    expect(screen.getByText(/2\/5 answered/)).toBeInTheDocument();
  });

  it('shows "Resume" for an in-progress attempt and "View answers" for a completed one', () => {
    render(
      <MyAttemptsList
        attempts={[
          makeAttempt({ id: 1, completed_at: null }),
          makeAttempt({ id: 2, completed_at: "2026-01-02T00:00:00Z" }),
        ]}
        paginationData={makePagination()}
      />,
    );

    expect(screen.getByRole("link", { name: "Resume" })).toHaveAttribute(
      "href",
      "/quizzes/10/attempt/1",
    );
    expect(screen.getByRole("link", { name: "View answers" })).toHaveAttribute(
      "href",
      "/quizzes/10/attempt/2",
    );
  });

  it("renders pagination when there is more than one page", () => {
    render(
      <MyAttemptsList
        attempts={[makeAttempt()]}
        paginationData={makePagination({ current_page: 1, last_page: 3 })}
      />,
    );

    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });

  it("does not render pagination when there is only one page", () => {
    render(
      <MyAttemptsList
        attempts={[makeAttempt()]}
        paginationData={makePagination({ last_page: 1 })}
      />,
    );

    expect(screen.queryByText(/Page \d+ of \d+/)).not.toBeInTheDocument();
  });
});
