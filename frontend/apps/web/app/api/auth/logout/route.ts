import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { logoutRequest } from "@/lib/auth/api";
import { AUTH_COOKIE } from "@/lib/auth/constants";

export async function POST() {
  const store = await cookies();
  const token = store.get(AUTH_COOKIE)?.value;

  if (token) {
    await logoutRequest(token).catch(() => {});
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.delete(AUTH_COOKIE);
  return response;
}
