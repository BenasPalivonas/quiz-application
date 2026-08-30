import { ApiError } from "@repo/api/http";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LoginForm } from "../LoginForm";

const mockPush = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: (): { push: typeof mockPush } => ({ push: mockPush }),
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
  }: {
    href: string;
    children: ReactNode;
  }): ReactElement => <a href={href}>{children}</a>,
}));

const { clientLogin } = vi.hoisted(() => ({
  clientLogin: vi.fn(),
}));

vi.mock("../../client-api", () => ({
  clientLogin,
}));

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.type(screen.getByLabelText("Password"), "password1");
}

describe("LoginForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the email and password fields", () => {
    render(<LoginForm />);

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Log in" })).toBeInTheDocument();
  });

  it("links to the register page", () => {
    render(<LoginForm />);

    expect(screen.getByRole("link", { name: "Register" })).toHaveAttribute(
      "href",
      "/register",
    );
  });

  it("submits the credentials and navigates home on success", async () => {
    const user = userEvent.setup();
    clientLogin.mockResolvedValue({
      user: { id: 1, name: "Ada", email: "ada@example.com" },
    });

    render(<LoginForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Log in" }));

    await waitFor(() => {
      expect(clientLogin).toHaveBeenCalledWith({
        email: "ada@example.com",
        password: "password1",
      });
    });
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows field errors when the API returns validation errors", async () => {
    const user = userEvent.setup();
    clientLogin.mockRejectedValue(
      new ApiError(422, "Validation failed", {
        email: ["The email field is required."],
      }),
    );

    render(<LoginForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByText("The email field is required."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Validation failed")).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows the API message when there are no field errors", async () => {
    const user = userEvent.setup();
    clientLogin.mockRejectedValue(new ApiError(401, "Invalid credentials"));

    render(<LoginForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(await screen.findByText("Invalid credentials")).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows a generic error when login fails without an API error", async () => {
    const user = userEvent.setup();
    clientLogin.mockRejectedValue(new Error("network error"));

    render(<LoginForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(
      await screen.findByText("Something went wrong. Please try again."),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("disables Log in while the request is in flight", async () => {
    const user = userEvent.setup();
    let resolveLogin: (value: {
      user: { id: number; name: string; email: string };
    }) => void = () => {};
    clientLogin.mockReturnValue(
      new Promise((resolve) => {
        resolveLogin = resolve;
      }),
    );

    render(<LoginForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Log in" }));

    expect(screen.getByRole("button", { name: "Log in" })).toBeDisabled();

    resolveLogin({
      user: { id: 1, name: "Ada", email: "ada@example.com" },
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
