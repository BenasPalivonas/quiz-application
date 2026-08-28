import { RegisterForm } from "../components/RegisterForm";

export function RegisterPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <h1 className="text-center text-2xl font-semibold">
          Create an account
        </h1>
        <RegisterForm />
      </div>
    </div>
  );
}
