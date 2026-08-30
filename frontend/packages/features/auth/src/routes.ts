import { SESSION_COOKIE, SESSION_COOKIE_MAX_AGE } from "@repo/api/server-fetch";
import { withApiErrorHandling } from "@repo/api/route-handler";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { loginRequest, logoutRequest, registerRequest } from "./api";
import type { AuthResponse } from "./types";

function authResponse({ user, token }: AuthResponse): NextResponse {
  const response = NextResponse.json({ user });
  response.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_COOKIE_MAX_AGE,
  });
  return response;
}

export async function handleLogin(request: Request): Promise<NextResponse> {
  const body = await request.json();
  return withApiErrorHandling(() => loginRequest(body), authResponse);
}

export async function handleRegister(
  request: Request,
): Promise<NextResponse> {
  const body = await request.json();
  return withApiErrorHandling(() => registerRequest(body), authResponse);
}

export async function handleLogout(): Promise<NextResponse> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;

  if (token) {
    await logoutRequest(token).catch(() => {});
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(SESSION_COOKIE);
  return response;
}
