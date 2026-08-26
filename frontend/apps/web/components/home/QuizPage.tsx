import { LogoutButton } from "@/components/auth/LogoutButton";
import type { User } from "@/lib/auth/types";

export function QuizPage({ user }: { user: User }) {
  return (
    <>
      <p className="text-lg">
        Welcome, <span className="font-semibold">{user.name}</span>
      </p>
      <LogoutButton />
    </>
  );
}
