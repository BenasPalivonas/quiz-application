import { cookies } from "next/headers";
import { apiFetch } from "./http";

export const SESSION_COOKIE = "auth_token";
export const SESSION_COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function getServerToken(): Promise<string | null> {
  const store = await cookies();
  return store.get(SESSION_COOKIE)?.value ?? null;
}

/** Calls the backend API on behalf of the current session, attaching its token. */
export async function serverApiFetch<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const token = await getServerToken();
  return apiFetch<T>(path, options, token);
}
