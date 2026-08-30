import { serverApiFetch } from "@repo/api/server-fetch";
import { cache } from "react";
import type { User } from "./types";

export const getServerUser = cache(async (): Promise<User | null> => {
  try {
    return await serverApiFetch<User>("/user");
  } catch {
    return null;
  }
});
