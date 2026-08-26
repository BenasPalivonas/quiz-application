import { ApiError } from "@/lib/api/client";
import type { User } from "./types";

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

export function clientLogin(email: string, password: string) {
  return postJson<{ user: User }>("/api/auth/login", { email, password });
}

export function clientRegister(name: string, email: string, password: string) {
  return postJson<{ user: User }>("/api/auth/register", {
    name,
    email,
    password,
  });
}

export function clientLogout() {
  return postJson<{ ok: true }>("/api/auth/logout", {});
}
