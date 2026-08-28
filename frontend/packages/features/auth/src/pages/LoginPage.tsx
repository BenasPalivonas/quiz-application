import type { ReactElement } from "react";
import { LoginForm } from "../components/LoginForm";

export function LoginPage(): ReactElement {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-center text-2xl font-semibold">Log in</h1>
        <LoginForm />
      </div>
    </div>
  );
}
