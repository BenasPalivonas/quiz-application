import { clientFetch } from "@repo/api/http";
import type { LoginPayload, RegisterPayload, User } from "./types";

export function clientLogin(
  payload: LoginPayload,
): Promise<{ user: User }> {
  return clientFetch<{ user: User }>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function clientRegister(
  payload: RegisterPayload,
): Promise<{ user: User }> {
  return clientFetch<{ user: User }>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function clientLogout(): Promise<{ ok: true }> {
  return clientFetch<{ ok: true }>("/api/auth/logout", { method: "POST" });
}
