import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { StartQuizButton } from "../StartQuizButton";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: (): { push: typeof mockPush } => ({ push: mockPush }),
}));

const { clientStartQuizAttempt } = vi.hoisted(() => ({
  clientStartQuizAttempt: vi.fn(),
}));

vi.mock("../../../../api/client-api", () => ({
  clientStartQuizAttempt,
}));

describe("StartQuizButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("navigates to the new attempt on a successful start", async () => {
    const user = userEvent.setup();
    clientStartQuizAttempt.mockResolvedValue({ data: { id: 42 } });

    render(<StartQuizButton quizId={7} />);
    await user.click(screen.getByRole("button", { name: "Start Quiz" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/quizzes/7/attempt/42");
    });
  });

  it("shows an error toast when starting the quiz fails", async () => {
    const user = userEvent.setup();
    clientStartQuizAttempt.mockRejectedValue(new Error("failed"));

    render(<StartQuizButton quizId={7} />);
    await user.click(screen.getByRole("button", { name: "Start Quiz" }));

    expect(
      await screen.findByText("Couldn't start the quiz. Please try again."),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("disables Start Quiz while the request is in flight", async () => {
    const user = userEvent.setup();
    let resolveStart: (value: { data: { id: number } }) => void = () => {};
    clientStartQuizAttempt.mockReturnValue(
      new Promise((resolve) => {
        resolveStart = resolve;
      }),
    );

    render(<StartQuizButton quizId={7} />);
    await user.click(screen.getByRole("button", { name: "Start Quiz" }));

    expect(screen.getByRole("button", { name: "Start Quiz" })).toBeDisabled();

    resolveStart({ data: { id: 42 } });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/quizzes/7/attempt/42");
    });
  });
});
