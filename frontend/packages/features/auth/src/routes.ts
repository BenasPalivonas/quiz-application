import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { loginRequest, logoutRequest, registerRequest } from "./api";
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE } from "./constants";
import { ApiError } from "./http";
import type { AuthResponse } from "./types";

function authResponse({ user, token }: AuthResponse): NextResponse {
  const response = NextResponse.json({ user });
  response.cookies.set(AUTH_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: AUTH_COOKIE_MAX_AGE,
  });
  return response;
}


export async function withApiErrorHandling<T>(
  action: () => Promise<T>,
  onSuccess: (data: T) => NextResponse,
): Promise<NextResponse> {
  try {
    return onSuccess(await action());
  } catch (error) {
    if (error instanceof ApiError) {
      return NextResponse.json(
        { message: error.message, errors: error.errors },
        { status: error.status },
      );
    }
    return NextResponse.json(
      { message: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
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
  const token = store.get(AUTH_COOKIE)?.value;

  if (token) {
    await logoutRequest(token).catch(() => {});
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
