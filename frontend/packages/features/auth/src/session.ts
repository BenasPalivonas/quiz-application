import { cookies } from "next/headers";
import { cache } from "react";
import { AUTH_COOKIE } from "./constants";
import { apiFetch } from "./http";
import type { User } from "./types";

export async function getServerToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(AUTH_COOKIE)?.value ?? null;
}

export async function serverApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getServerToken();
  return apiFetch<T>(path, options, token);
}

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
