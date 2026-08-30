import { apiFetch } from "@repo/api/http";
import type { AuthResponse, LoginPayload, RegisterPayload } from "./types";

export function registerRequest(
  payload: RegisterPayload,
): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginRequest(payload: LoginPayload): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutRequest(token: string): Promise<void> {
  return apiFetch<void>("/logout", { method: "POST" }, token);
}
