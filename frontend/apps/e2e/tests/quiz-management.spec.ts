import type { RegisterPayload } from "@repo/auth/types";
import {
  expect,
  request,
  test,
  type Locator,
  type Page,
} from "@playwright/test";
import { randomUUID } from "crypto";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

type QuizQuestionInput = { text: string; choices: string[] };
type QuizInput = { title: string; questions: QuizQuestionInput[] };

function uniqueUser(): RegisterPayload {
  return {
    name: "E2E Quiz User",
    email: `e2e-quiz-${randomUUID()}@example.com`,
    password: "password123",
  };
}

function uniqueTitle(label: string): string {
  return `${label} ${randomUUID()}`;
}

async function registerViaApi(user: RegisterPayload): Promise<void> {
  const api = await request.newContext();
  const res = await api.post(`${API_URL}/register`, { data: user });
  if (!res.ok()) {
    throw new Error(`Failed to seed user via API: ${res.status()} ${await res.text()}`);
  }
  await api.dispose();
}

async function loginViaUi(page: Page, user: RegisterPayload): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(user.email);
  await page.getByLabel("Password").fill(user.password);
  await page.getByRole("button", { name: "Log in" }).click();
  await expect(page).toHaveURL("/");
}

async function registerAndLogin(
  page: Page,
  user: RegisterPayload,
): Promise<void> {
  await registerViaApi(user);
  await loginViaUi(page, user);
}

async function fillQuizTitleStep(page: Page, title: string): Promise<void> {
  await page.getByLabel("Quiz title").fill(title);
  await page.getByRole("button", { name: "Continue" }).click();
}

async function fillCurrentQuestion(
  page: Page,
  questionNumber: number,
  question: QuizQuestionInput,
): Promise<void> {
  await page.getByLabel(`Question ${questionNumber}`).fill(question.text);

  for (let i = 2; i < question.choices.length; i++) {
    await page.getByRole("button", { name: "Add choice" }).click();
  }

  for (let i = 0; i < question.choices.length; i++) {
    await page.getByLabel(`Choice ${i + 1}`).fill(question.choices[i]!);
  }
}

async function fillQuestionsStep(
  page: Page,
  questions: QuizQuestionInput[],
): Promise<void> {
  for (let i = 0; i < questions.length; i++) {
    if (i > 0) {
      await page.getByRole("button", { name: "Add question" }).click();
    }
    await fillCurrentQuestion(page, i + 1, questions[i]!);
  }
}

/** Fills out and submits the create-quiz form, returning the created quiz's id. */
async function createQuiz(page: Page, quiz: QuizInput): Promise<number> {
  await page.goto("/quizzes/create");
  await fillQuizTitleStep(page, quiz.title);
  await fillQuestionsStep(page, quiz.questions);

  const [response] = await Promise.all([
    page.waitForResponse(
      (res) => res.url().endsWith("/api/quizzes") && res.request().method() === "POST",
    ),
    page.getByRole("button", { name: "Create quiz" }).click(),
  ]);

  await expect(page).toHaveURL("/");
  const body = await response.json();
  return body.data.id as number;
}

function myQuizRow(page: Page, title: string): Locator {
  return page.getByRole("listitem").filter({ hasText: title });
}

test.describe("quiz creation", () => {
  test("creates a quiz with a title and questions, then lists it under My quizzes", async ({ page }) => {
    const user = uniqueUser();
    await registerAndLogin(page, user);

    const title = uniqueTitle("Create Flow Quiz");
    await createQuiz(page, {
      title,
      questions: [
        { text: "Free Saturday, no plans — what do you do?", choices: ["Go on an adventure", "Read a book"] },
        { text: "Pick a snack", choices: ["Chips", "Fruit", "Chocolate"] },
      ],
    });

    await page.getByRole("link", { name: "My creations" }).click();
    await expect(page).toHaveURL("/quizzes/mine");

    const row = myQuizRow(page, title);
    await expect(row).toBeVisible();
    await expect(row.getByText("2 questions")).toBeVisible();
  });

  test("shows a validation error when the title is empty", async ({ page }) => {
    const user = uniqueUser();
    await registerAndLogin(page, user);

    await page.goto("/quizzes/create");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByText("Title is required")).toBeVisible();
    await expect(page).toHaveURL("/quizzes/create");
  });
});

test.describe("quiz update", () => {
  test("updates an existing quiz's title and questions", async ({ page }) => {
    const user = uniqueUser();
    await registerAndLogin(page, user);

    const originalTitle = uniqueTitle("Original Quiz");
    await createQuiz(page, {
      title: originalTitle,
      questions: [{ text: "Original question", choices: ["Original choice 1", "Original choice 2"] }],
    });

    await page.getByRole("link", { name: "My creations" }).click();
    await myQuizRow(page, originalTitle).getByRole("button", { name: "Edit" }).click();
    await expect(page).toHaveURL(/\/quizzes\/\d+\/edit/);

    const updatedTitle = uniqueTitle("Updated Quiz");
    await expect(page.getByLabel("Quiz title")).toHaveValue(originalTitle);
    await page.getByLabel("Quiz title").fill(updatedTitle);
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page.getByLabel("Question 1")).toHaveValue("Original question");
    await page.getByLabel("Question 1").fill("Updated question");
    await page.getByLabel("Choice 1").fill("Updated choice 1");

    await page.getByRole("button", { name: "Add question" }).click();
    await fillCurrentQuestion(page, 2, { text: "Second question", choices: ["Choice A", "Choice B"] });

    await page.getByRole("button", { name: "Save changes" }).click();
    await expect(page).toHaveURL("/quizzes/mine");

    const updatedRow = myQuizRow(page, updatedTitle);
    await expect(updatedRow).toBeVisible();
    await expect(updatedRow.getByText("2 questions")).toBeVisible();
    await expect(myQuizRow(page, originalTitle)).toHaveCount(0);
  });

  test("prevents a non-owner from editing another user's quiz", async ({ page, browser }) => {
    const owner = uniqueUser();
    await registerAndLogin(page, owner);

    const title = uniqueTitle("Owned Quiz");
    const quizId = await createQuiz(page, {
      title,
      questions: [{ text: "Owner-only question", choices: ["Choice 1", "Choice 2"] }],
    });

    const intruderContext = await browser.newContext();
    const intruderPage = await intruderContext.newPage();
    try {
      const intruder = uniqueUser();
      await registerAndLogin(intruderPage, intruder);

      await intruderPage.goto(`/quizzes/${quizId}/edit`);
      await expect(intruderPage).toHaveURL("/quizzes/mine");
    } finally {
      await intruderContext.close();
    }
  });
});

test.describe("quiz deletion", () => {
  test("deletes a quiz after confirming", async ({ page }) => {
    const user = uniqueUser();
    await registerAndLogin(page, user);

    const title = uniqueTitle("Quiz To Delete");
    await createQuiz(page, {
      title,
      questions: [{ text: "Doomed question", choices: ["Choice 1", "Choice 2"] }],
    });

    await page.getByRole("link", { name: "My creations" }).click();
    await expect(myQuizRow(page, title)).toBeVisible();

    page.once("dialog", (dialog) => dialog.accept());
    await myQuizRow(page, title).getByRole("button", { name: "Delete" }).click();

    await expect(myQuizRow(page, title)).toHaveCount(0);
    await expect(page.getByText("You haven't created any quizzes yet.")).toBeVisible();
  });

  test("keeps the quiz when the confirmation is dismissed", async ({ page }) => {
    const user = uniqueUser();
    await registerAndLogin(page, user);

    const title = uniqueTitle("Quiz To Keep");
    await createQuiz(page, {
      title,
      questions: [{ text: "Safe question", choices: ["Choice 1", "Choice 2"] }],
    });

    await page.getByRole("link", { name: "My creations" }).click();

    page.once("dialog", (dialog) => dialog.dismiss());
    await myQuizRow(page, title).getByRole("button", { name: "Delete" }).click();

    await expect(myQuizRow(page, title)).toBeVisible();
    await page.reload();
    await expect(myQuizRow(page, title)).toBeVisible();
  });
});
