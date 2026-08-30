import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LogoutButton } from "../LogoutButton";

const mockPush = vi.fn();
const mockRefresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: (): { push: typeof mockPush; refresh: typeof mockRefresh } => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

const { clientLogout } = vi.hoisted(() => ({
  clientLogout: vi.fn(),
}));

vi.mock("../../client-api", () => ({
  clientLogout,
}));

describe("LogoutButton", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("logs out and navigates home", async () => {
    const user = userEvent.setup();
    clientLogout.mockResolvedValue({ ok: true });

    render(<LogoutButton />);
    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(clientLogout).toHaveBeenCalledTimes(1);
    });
    expect(mockPush).toHaveBeenCalledWith("/");
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });

  it("navigates home even when logout fails", async () => {
    const user = userEvent.setup();
    clientLogout.mockRejectedValue(new Error("network error"));

    render(<LogoutButton />);
    await user.click(screen.getByRole("button", { name: "Log out" }));

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
    expect(mockRefresh).toHaveBeenCalledTimes(1);
  });
});
