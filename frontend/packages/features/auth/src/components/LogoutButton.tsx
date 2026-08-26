"use client";

import { useRouter } from "next/navigation";
import { Button } from "@repo/ui/button";
import { clientLogout } from "../client-api";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await clientLogout().catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <Button type="button" variant="secondary" onClick={handleLogout}>
      Log out
    </Button>
  );
}
