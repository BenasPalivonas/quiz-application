import { LogoutButton } from "@repo/auth/components/LogoutButton";
import { Button } from "@repo/ui/button";
import Link from "next/link";

export function Navbar() {
  return (
    <nav className="relative flex w-full items-center justify-end px-4 py-4">
      <div className="flex items-center gap-3">
        <Link href="/attempts">
          <Button type="button" variant="secondary">
            My quizzess
          </Button>
        </Link>
        <Link href="/quizzes/mine">
          <Button type="button" variant="secondary">
            My creations
          </Button>
        </Link>
        <LogoutButton />
      </div>
    </nav>
  );
}
