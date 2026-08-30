import { ApiError } from "@repo/api/http";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { ReactElement, ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RegisterForm } from "../RegisterForm";

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

const { clientRegister } = vi.hoisted(() => ({
  clientRegister: vi.fn(),
}));

vi.mock("../../client-api", () => ({
  clientRegister,
}));

async function fillForm(
  user: ReturnType<typeof userEvent.setup>,
): Promise<void> {
  await user.type(screen.getByLabelText("Name"), "Ada");
  await user.type(screen.getByLabelText("Email"), "ada@example.com");
  await user.type(screen.getByLabelText("Password"), "password1");
}

describe("RegisterForm", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("shows the name, email, and password fields", () => {
    render(<RegisterForm />);

    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByLabelText("Password")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeInTheDocument();
  });

  it("links to the login page", () => {
    render(<RegisterForm />);

    expect(screen.getByRole("link", { name: "Log in" })).toHaveAttribute(
      "href",
      "/login",
    );
  });

  it("submits the credentials and navigates home on success", async () => {
    const user = userEvent.setup();
    clientRegister.mockResolvedValue({
      user: { id: 1, name: "Ada", email: "ada@example.com" },
    });

    render(<RegisterForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    await waitFor(() => {
      expect(clientRegister).toHaveBeenCalledWith({
        name: "Ada",
        email: "ada@example.com",
        password: "password1",
      });
    });
    expect(mockPush).toHaveBeenCalledWith("/");
  });

  it("shows field errors when the API returns validation errors", async () => {
    const user = userEvent.setup();
    clientRegister.mockRejectedValue(
      new ApiError(422, "Validation failed", {
        email: ["The email has already been taken."],
      }),
    );

    render(<RegisterForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("The email has already been taken."),
    ).toBeInTheDocument();
    expect(screen.queryByText("Validation failed")).not.toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows the API message when there are no field errors", async () => {
    const user = userEvent.setup();
    clientRegister.mockRejectedValue(
      new ApiError(500, "Unable to create account"),
    );

    render(<RegisterForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("Unable to create account"),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("shows a generic error when registration fails without an API error", async () => {
    const user = userEvent.setup();
    clientRegister.mockRejectedValue(new Error("network error"));

    render(<RegisterForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      await screen.findByText("Something went wrong. Please try again."),
    ).toBeInTheDocument();
    expect(mockPush).not.toHaveBeenCalled();
  });

  it("disables Create account while the request is in flight", async () => {
    const user = userEvent.setup();
    let resolveRegister: (value: {
      user: { id: number; name: string; email: string };
    }) => void = () => {};
    clientRegister.mockReturnValue(
      new Promise((resolve) => {
        resolveRegister = resolve;
      }),
    );

    render(<RegisterForm />);
    await fillForm(user);
    await user.click(screen.getByRole("button", { name: "Create account" }));

    expect(
      screen.getByRole("button", { name: "Create account" }),
    ).toBeDisabled();

    resolveRegister({
      user: { id: 1, name: "Ada", email: "ada@example.com" },
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/");
    });
  });
});
