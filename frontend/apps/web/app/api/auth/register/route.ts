import { NextResponse } from "next/server";
import { ApiError } from "@/lib/api/client";
import { registerRequest } from "@/lib/auth/api";
import { AUTH_COOKIE, AUTH_COOKIE_MAX_AGE } from "@/lib/auth/constants";

export async function POST(request: Request) {
  const body = await request.json();

  try {
    const { user, token } = await registerRequest(body);

    const response = NextResponse.json({ user });
    response.cookies.set(AUTH_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: AUTH_COOKIE_MAX_AGE,
    });
    return response;
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
