import { NextResponse } from "next/server";
import { ApiError } from "./http";

/** Wraps a Next.js API route action, translating ApiError into a JSON error response. */
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
