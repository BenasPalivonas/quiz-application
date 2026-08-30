import { describe, expect, it } from "vitest";
import { NextResponse } from "next/server";
import { ApiError } from "../http";
import { withApiErrorHandling } from "../route-handler";

describe("withApiErrorHandling", () => {
  it("returns the success response when the action resolves", async () => {
    const response = await withApiErrorHandling(
      () => Promise.resolve({ id: 1 }),
      (data) => NextResponse.json(data, { status: 201 }),
    );

    expect(response.status).toBe(201);
    await expect(response.json()).resolves.toEqual({ id: 1 });
  });

  it("translates an ApiError into a JSON response with its status", async () => {
    const response = await withApiErrorHandling<never>(
      () => Promise.reject(new ApiError(422, "Validation failed", { title: ["is required"] })),
      (data) => NextResponse.json(data, { status: 200 }),
    );

    expect(response.status).toBe(422);
    await expect(response.json()).resolves.toEqual({
      message: "Validation failed",
      errors: { title: ["is required"] },
    });
  });

  it("falls back to a generic 500 response for unexpected errors", async () => {
    const response = await withApiErrorHandling<never>(
      () => Promise.reject(new Error("boom")),
      (data) => NextResponse.json(data, { status: 200 }),
    );

    expect(response.status).toBe(500);
    await expect(response.json()).resolves.toEqual({
      message: "Something went wrong. Please try again.",
    });
  });
});
