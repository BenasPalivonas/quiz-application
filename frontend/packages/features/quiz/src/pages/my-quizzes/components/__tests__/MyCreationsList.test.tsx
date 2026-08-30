import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { PaginationMeta, Quiz } from "../../../../models/types";
import { MyCreationsList } from "../MyCreationsList";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mockPush, refresh: mockRefresh }),
  usePathname: () => "/quizzes/mine",
}));

const { clientDeleteQuiz } = vi.hoisted(() => ({
  clientDeleteQuiz: vi.fn(),
}));

vi.mock("../../../../api/client-api", () => ({
  clientDeleteQuiz,
}));

function makeQuiz(overrides: Partial<Quiz> = {}): Quiz {
  return {
    id: 1,
    title: "Animal Quiz",
    user_id: 1,
    is_owner: true,
    questions_count: 3,
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

describe("MyCreationsList", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows an empty-state message when there are no quizzes", () => {
    render(<MyCreationsList quizzes={[]} paginationData={makePagination()} />);

    expect(
      screen.getByText("You haven't created any quizzes yet."),
    ).toBeInTheDocument();
  });

  it("renders the quiz title and question count", () => {
    render(
      <MyCreationsList
        quizzes={[makeQuiz()]}
        paginationData={makePagination()}
      />,
    );

    expect(screen.getByText("Animal Quiz")).toBeInTheDocument();
    expect(screen.getByText("3 questions")).toBeInTheDocument();
  });

  it("uses the singular 'question' when there is exactly one", () => {
    render(
      <MyCreationsList
        quizzes={[makeQuiz({ questions_count: 1 })]}
        paginationData={makePagination()}
      />,
    );

    expect(screen.getByText("1 question")).toBeInTheDocument();
  });

  it("navigates to the edit page when Edit is clicked", async () => {
    const user = userEvent.setup();

    render(
      <MyCreationsList
        quizzes={[makeQuiz({ id: 7 })]}
        paginationData={makePagination()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Edit" }));

    expect(mockPush).toHaveBeenCalledWith("/quizzes/7/edit");
  });

  it("deletes the quiz and removes it from the list when confirmed", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    clientDeleteQuiz.mockResolvedValue(undefined);
    const user = userEvent.setup();

    render(
      <MyCreationsList
        quizzes={[makeQuiz()]}
        paginationData={makePagination()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));

    await waitFor(() => {
      expect(
        screen.getByText("You haven't created any quizzes yet."),
      ).toBeInTheDocument();
    });
    expect(clientDeleteQuiz).toHaveBeenCalledWith(1);
  });

  it("keeps the quiz visible and does not call the API when the confirm dialog is cancelled", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(false);
    const user = userEvent.setup();

    render(
      <MyCreationsList
        quizzes={[makeQuiz()]}
        paginationData={makePagination()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(clientDeleteQuiz).not.toHaveBeenCalled();
    expect(screen.getByText("Animal Quiz")).toBeInTheDocument();
  });

  it("shows an error toast when deleting fails", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);
    clientDeleteQuiz.mockRejectedValue(new Error("failed"));
    const user = userEvent.setup();

    render(
      <MyCreationsList
        quizzes={[makeQuiz()]}
        paginationData={makePagination()}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Delete" }));

    expect(
      await screen.findByText("Couldn't delete the quiz. Please try again."),
    ).toBeInTheDocument();
    expect(screen.getByText("Animal Quiz")).toBeInTheDocument();
  });

  it("renders pagination when there is more than one page", () => {
    render(
      <MyCreationsList
        quizzes={[makeQuiz()]}
        paginationData={makePagination({ current_page: 1, last_page: 3 })}
      />,
    );

    expect(screen.getByText("Page 1 of 3")).toBeInTheDocument();
  });
});
