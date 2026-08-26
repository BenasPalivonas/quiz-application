import { getServerToken, serverApiFetch } from "@/lib/api/server-client";
import { cache } from "react";
import type { User } from "./types";

export const getServerUser = cache(async (): Promise<User | null> => {
  const token = await getServerToken();
  if (!token) {
    return null;
  }

  try {
    return await serverApiFetch<User>("/user");
  } catch {
    return null;
  }
});
