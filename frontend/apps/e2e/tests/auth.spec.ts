import { expect, request, test } from "@playwright/test";
import { randomUUID } from 'crypto';

const API_URL = process.env.API_URL ?? "http://127.0.0.1:8000/api";

type NewUser = { name: string; email: string; password: string };

function uniqueUser(): NewUser {
  return {
    name: "E2E Test User",
    email: `e2e-${randomUUID()}@example.com`,
    password: "password123",
  };
}

async function registerViaApi(user: NewUser) {
  const api = await request.newContext();
  const res = await api.post(`${API_URL}/register`, { data: user });
  if (!res.ok()) {
    throw new Error(`Failed to seed user via API: ${res.status()} ${await res.text()}`);
  }
  await api.dispose();
}

test.describe("root path", () => {
  test("redirects an unauthenticated visitor straight to /login", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL("/login");
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  });
});

test.describe("register", () => {
  test("links to the login page", async ({ page }) => {
    await page.goto("/register");
    await page.getByRole("link", { name: "Log in" }).click();
    await expect(page).toHaveURL("/login");
  });

  test("registers a new user and lands on the quiz page", async ({ page }) => {
    const user = uniqueUser();

    await page.goto("/register");
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText(`Welcome, ${user.name}`)).toBeVisible();
  });

  test("shows a validation error when the email is already taken", async ({ page }) => {
    const user = uniqueUser();
    await registerViaApi(user);

    await page.goto("/register");
    await page.getByLabel("Name").fill(user.name);
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Create account" }).click();

    await expect(page.getByText(/email has already been taken/i)).toBeVisible();
    await expect(page).toHaveURL("/register");
  });

  test("an already authenticated user is redirected away from /register", async ({ page }) => {
    const user = uniqueUser();
    await registerViaApi(user);

    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/register");
    await expect(page).toHaveURL("/");
  });
});

test.describe("login", () => {
  test("links to the register page", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Register" }).click();
    await expect(page).toHaveURL("/register");
  });

  test("logs an existing user in", async ({ page }) => {
    const user = uniqueUser();
    await registerViaApi(user);

    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByText(`Welcome, ${user.name}`)).toBeVisible();
  });

  test("shows an error for incorrect credentials", async ({ page }) => {
    const user = uniqueUser();
    await registerViaApi(user);

    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill("wrong-password");
    await page.getByRole("button", { name: "Log in" }).click();

    await expect(page.getByText(/provided credentials are incorrect/i)).toBeVisible();
    await expect(page).toHaveURL("/login");
  });
});

test.describe("logout", () => {
  test("returns to /login and clears the session", async ({ page }) => {
    const user = uniqueUser();
    await registerViaApi(user);

    await page.goto("/login");
    await page.getByLabel("Email").fill(user.email);
    await page.getByLabel("Password").fill(user.password);
    await page.getByRole("button", { name: "Log in" }).click();
    await expect(page).toHaveURL("/");

    await page.getByRole("button", { name: "Log out" }).click();
    await expect(page).toHaveURL("/login");

    // session cookie is gone, so the home page redirects again
    await page.goto("/");
    await expect(page).toHaveURL("/login");
  });
});
