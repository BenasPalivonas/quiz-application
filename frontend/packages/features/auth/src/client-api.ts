import { ApiError } from "./http";
import type { LoginPayload, RegisterPayload, User } from "./types";

async function postJson<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    throw new ApiError(
      res.status,
      data?.message ?? "Something went wrong. Please try again.",
      data?.errors,
    );
  }

  return data as T;
}

export function clientLogin(
  payload: LoginPayload,
): Promise<{ user: User }> {
  return postJson<{ user: User }>("/api/auth/login", payload);
}

export function clientRegister(
  payload: RegisterPayload,
): Promise<{ user: User }> {
  return postJson<{ user: User }>("/api/auth/register", payload);
}

export function clientLogout(): Promise<{ ok: true }> {
  return postJson<{ ok: true }>("/api/auth/logout", {});
}
