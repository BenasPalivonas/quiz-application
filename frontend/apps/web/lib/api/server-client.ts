import { cookies } from "next/headers";
import { AUTH_COOKIE } from "@/lib/auth/constants";
import { apiFetch } from "./client";

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
