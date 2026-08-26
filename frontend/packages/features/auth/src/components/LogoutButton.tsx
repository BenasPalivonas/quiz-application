"use client";

import { useRouter } from "next/navigation";
import { clientLogout } from "../client-api";

export function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await clientLogout().catch(() => {});
    router.push("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      className="rounded-md border border-black/15 px-4 py-2 text-sm font-medium dark:border-white/20"
    >
      Log out
    </button>
  );
}
