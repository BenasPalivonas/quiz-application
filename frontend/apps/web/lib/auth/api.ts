import { apiFetch } from "@/lib/api/client";
import type { AuthResponse } from "./types";

export function registerRequest(payload: {
  name: string;
  email: string;
  password: string;
}) {
  return apiFetch<AuthResponse>("/register", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function loginRequest(payload: { email: string; password: string }) {
  return apiFetch<AuthResponse>("/login", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function logoutRequest(token: string) {
  return apiFetch<void>("/logout", { method: "POST" }, token);
}
