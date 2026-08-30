import { afterEach, describe, expect, it, vi } from "vitest";
import { apiFetch, ApiError, clientFetch } from "../http";

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("apiFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("resolves with the parsed body on a successful response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(200, { id: 1 }));

    const result = await apiFetch<{ id: number }>("/quizzes/1");

    expect(result).toEqual({ id: 1 });
  });

  it("attaches a bearer token and JSON content-type when a body is sent", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(200, {}));

    await apiFetch("/quizzes", { body: JSON.stringify({ title: "x" }) }, "token-123");

    const [, options] = fetchSpy.mock.calls[0]!;
    const headers = options!.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer token-123");
    expect(headers["Content-Type"]).toBe("application/json");
  });

  it("returns undefined for a 204 response without reading the body", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(null, { status: 204 }));

    const result = await apiFetch("/quizzes/1");

    expect(result).toBeUndefined();
  });

  it("throws an ApiError with status, message, and field errors on failure", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(
      jsonResponse(422, {
        message: "Validation failed",
        errors: { title: ["is required"] },
      }),
    );

    await expect(apiFetch("/quizzes")).rejects.toMatchObject({
      name: "ApiError",
      status: 422,
      message: "Validation failed",
      errors: { title: ["is required"] },
    });
  });

  it("falls back to a generic message when the error body isn't JSON", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("not json", { status: 500 }));

    await expect(apiFetch("/quizzes")).rejects.toThrow(
      "Something went wrong. Please try again.",
    );
  });
});

describe("clientFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("does not attach an Authorization header", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(200, {}));

    await clientFetch("/api/quizzes");

    const [, options] = fetchSpy.mock.calls[0]!;
    const headers = options!.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });

  it("rejects with ApiError on a non-ok response", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(404, { message: "Not found" }));

    await expect(clientFetch("/api/quizzes/1")).rejects.toBeInstanceOf(ApiError);
  });
});
