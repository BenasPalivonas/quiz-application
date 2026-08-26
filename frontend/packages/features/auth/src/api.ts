import { apiFetch } from "./http";
import type { AuthResponse, LoginPayload, RegisterPayload } from "./types";

export function registerRequest(payload: RegisterPayload) {
  return apiFetch<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginRequest(payload: LoginPayload) {
  return apiFetch<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutRequest(token: string) {
  return apiFetch<void>("/logout", { method: "POST" }, token);
}
