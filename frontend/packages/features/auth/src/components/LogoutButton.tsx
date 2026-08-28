"use client";

import { useRouter } from "next/navigation";
import type { ReactElement } from "react";
import { Button } from "@repo/ui/button";
import { clientLogout } from "../client-api";

export function LogoutButton(): ReactElement {
  const router = useRouter();

  async function handleLogout(): Promise<void> {
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
