import { afterEach, describe, expect, it, vi } from "vitest";
import { cookies } from "next/headers";
import { getServerToken, serverApiFetch, SESSION_COOKIE } from "../server-fetch";

vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("getServerToken", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the session cookie's value when present", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ name: SESSION_COOKIE, value: "token-123" }),
    } as never);

    await expect(getServerToken()).resolves.toBe("token-123");
  });

  it("returns null when the session cookie is missing", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as never);

    await expect(getServerToken()).resolves.toBeNull();
  });
});

describe("serverApiFetch", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("attaches the session token from cookies to the request", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue({ name: SESSION_COOKIE, value: "token-123" }),
    } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(200, { id: 1 }));

    await serverApiFetch("/quizzes/1");

    const [, options] = fetchSpy.mock.calls[0]!;
    const headers = options!.headers as Record<string, string>;
    expect(headers.Authorization).toBe("Bearer token-123");
  });

  it("omits the Authorization header when there is no session", async () => {
    vi.mocked(cookies).mockResolvedValue({
      get: vi.fn().mockReturnValue(undefined),
    } as never);
    const fetchSpy = vi.spyOn(globalThis, "fetch").mockResolvedValue(jsonResponse(200, { id: 1 }));

    await serverApiFetch("/quizzes/1");

    const [, options] = fetchSpy.mock.calls[0]!;
    const headers = options!.headers as Record<string, string>;
    expect(headers.Authorization).toBeUndefined();
  });
});
