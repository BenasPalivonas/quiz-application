import { expect, request, test, type Page } from "@playwright/test";
import type { RegisterPayload } from "@repo/auth/types";
import type { Choice, Question, Quiz, QuizAttempt } from "@repo/quiz/types";
import { randomUUID } from "crypto";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000/api";

type QuizQuestionInput = { text: string; choices: string[] };
type QuizInput = { title: string; questions: QuizQuestionInput[] };

function uniqueUser(): RegisterPayload {
  return {
    name: "E2E Submission User",
    email: `e2e-submission-${randomUUID()}@example.com`,
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

/** Creates a quiz directly through the Next.js API route, skipping the create-quiz form (covered elsewhere). */
async function createQuizViaApi(page: Page, quiz: QuizInput): Promise<Quiz> {
  const res = await page.request.post("/api/quizzes", {
    data: {
      title: quiz.title,
      questions: quiz.questions.map((question) => ({
        text: question.text,
        choices: question.choices.map((text) => ({ text })),
      })),
    },
  });
  if (!res.ok()) {
    throw new Error(`Failed to create quiz via API: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  return body.data as Quiz;
}

async function startAttemptViaApi(page: Page, quizId: number): Promise<QuizAttempt> {
  const res = await page.request.post(`/api/quizzes/${quizId}/attempts`);
  if (!res.ok()) {
    throw new Error(`Failed to start attempt via API: ${res.status()} ${await res.text()}`);
  }
  const body = await res.json();
  return body.data as QuizAttempt;
}

async function submitAnswerViaApi(
  page: Page,
  attemptId: number,
  question: Question,
  choice: Choice,
): Promise<void> {
  const res = await page.request.post(`/api/attempts/${attemptId}/answers`, {
    data: {
      question_id: question.id,
      choice_id: choice.id,
      time_spent_ms: 1500,
    },
  });
  if (!res.ok()) {
    throw new Error(`Failed to submit answer via API: ${res.status()} ${await res.text()}`);
  }
}

function attemptUrl(quizId: number, attemptId: number): string {
  return `/quizzes/${quizId}/attempt/${attemptId}`;
}

/** Builds a QuizAttemptResource-shaped payload for mocking the (real, AI-backed) complete endpoint. */
function mockedCompletionBody(
  attempt: QuizAttempt,
  quiz: Quiz,
  picks: { question: Question; choice: Choice }[],
  aiFeedback: string,
): { data: QuizAttempt } {
  return {
    data: {
      id: attempt.id,
      quiz_id: quiz.id,
      quiz_title: quiz.title,
      quiz_questions_count: quiz.questions!.length,
      answered_questions_count: picks.length,
      started_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      ai_feedback: aiFeedback,
      answers: picks.map(({ question, choice }, index) => ({
        id: index + 1,
        question_id: question.id,
        question_text: question.text,
        choice_id: choice.id,
        choice_text: choice.text,
        time_spent_ms: 1500,
      })),
    },
  };
}

test.describe("taking a quiz", () => {
  /* This is the ONLY test in the suite that lets the real "complete attempt"
  request through. That endpoint calls a real AI model on the backend, so
  every other test around it mocks that one request instead of triggering
  another real call. This is done to save on token usage. */
  test("walks through every question via the real APIs, gets AI feedback, and keeps showing it on reload", async ({
    page,
  }) => {
    test.setTimeout(30_000);

    const user = uniqueUser();
    await registerAndLogin(page, user);

    const quizTitle = uniqueTitle("Real Submission Quiz");
    const quiz = await createQuizViaApi(page, {
      title: quizTitle,
      questions: [
        { text: "Free Saturday, no plans - what do you do?", choices: ["Go on an adventure", "Read a book"] },
        { text: "Pick a snack", choices: ["Chips", "Fruit"] },
      ],
    });

    const completeRequests: string[] = [];
    page.on("request", (req) => {
      if (req.method() === "POST" && /\/api\/attempts\/\d+\/complete$/.test(new URL(req.url()).pathname)) {
        completeRequests.push(req.url());
      }
    });

    await page.goto("/");
    await page
      .getByRole("listitem")
      .filter({ hasText: quizTitle })
      .getByRole("button", { name: "Start Quiz" })
      .click();
    await page.waitForURL(/\/quizzes\/\d+\/attempt\/\d+/);

    await expect(page.getByText("Question 1 of 2")).toBeVisible();
    await page.getByRole("button", { name: quiz.questions![0]!.choices[0]!.text, exact: true }).click();

    await expect(page.getByText("Question 2 of 2")).toBeVisible();
    await page.getByRole("button", { name: quiz.questions![1]!.choices[1]!.text, exact: true }).click();

    await expect(page.getByText("Generating your personalized result...")).toBeVisible();
    await expect(page.getByRole("heading", { name: "Your result" })).toBeVisible({ timeout: 10_000 });

    const feedback = page.locator("p.whitespace-pre-line");
    await expect(feedback).not.toHaveText("");

    const answerItems = page.getByRole("listitem");
    await expect(answerItems).toHaveCount(2);
    await expect(answerItems.nth(0)).toContainText(quiz.questions![0]!.text);
    await expect(answerItems.nth(0)).toContainText(quiz.questions![0]!.choices[0]!.text);
    await expect(answerItems.nth(1)).toContainText(quiz.questions![1]!.text);
    await expect(answerItems.nth(1)).toContainText(quiz.questions![1]!.choices[1]!.text);

    expect(completeRequests).toHaveLength(1);

    // Reloading a completed attempt must show the stored result, not re-run completion.
    await page.reload();
    await expect(page.getByRole("heading", { name: "Your result" })).toBeVisible();
    expect(completeRequests).toHaveLength(1);
  });

  test("supports revising an earlier answer by going back, and returns to the quiz list from the first question", async ({
    page,
  }) => {
    const user = uniqueUser();
    await registerAndLogin(page, user);

    const quiz = await createQuizViaApi(page, {
      title: uniqueTitle("Back Navigation Quiz"),
      questions: [
        { text: "Question one", choices: ["One A", "One B"] },
        { text: "Question two", choices: ["Two A", "Two B"] },
        { text: "Question three", choices: ["Three A", "Three B"] },
      ],
    });
    const attempt = await startAttemptViaApi(page, quiz.id);

    await page.goto(attemptUrl(quiz.id, attempt.id));

    await expect(page.getByText("Question 1 of 3")).toBeVisible();
    await page.getByRole("button", { name: "One A", exact: true }).click();

    await expect(page.getByText("Question 2 of 3")).toBeVisible();
    await page.getByRole("button", { name: "Back" }).click();

    await expect(page.getByText("Question 1 of 3")).toBeVisible();
    await expect(page.getByRole("button", { name: "One A", exact: true })).toHaveClass(/ring-2/);

    // Picking a different choice updates the saved answer and advances again.
    await page.getByRole("button", { name: "One B", exact: true }).click();
    await expect(page.getByText("Question 2 of 3")).toBeVisible();

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page.getByText("Question 1 of 3")).toBeVisible();
    await expect(page.getByRole("button", { name: "One B", exact: true })).toHaveClass(/ring-2/);

    await page.getByRole("button", { name: "Back" }).click();
    await expect(page).toHaveURL("/");
  });
});

test.describe("generating the result", () => {
  test("shows an error with a retry option when generation fails, and recovers on retry", async ({ page }) => {
    const user = uniqueUser();
    await registerAndLogin(page, user);

    const quiz = await createQuizViaApi(page, {
      title: uniqueTitle("Retry Quiz"),
      questions: [{ text: "Only question", choices: ["Choice A", "Choice B"] }],
    });
    const attempt = await startAttemptViaApi(page, quiz.id);

    let completeCallCount = 0;
    await page.route("**/api/attempts/*/complete", async (route) => {
      completeCallCount++;
      if (completeCallCount === 1) {
        await route.fulfill({
          status: 500,
          contentType: "application/json",
          body: JSON.stringify({ message: "Something went wrong. Please try again." }),
        });
        return;
      }
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          mockedCompletionBody(
            attempt,
            quiz,
            [{ question: quiz.questions![0]!, choice: quiz.questions![0]!.choices[0]! }],
            "You are: The Mocked Result",
          ),
        ),
      });
    });

    await page.goto(attemptUrl(quiz.id, attempt.id));
    await page.getByRole("button", { name: "Choice A", exact: true }).click();

    await expect(
      page.getByText("Something went wrong while generating your result. Please try again."),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Try again" })).toBeVisible();

    await page.getByRole("button", { name: "Try again" }).click();

    await expect(page.getByRole("heading", { name: "Your result" })).toBeVisible();
    await expect(page.getByText("You are: The Mocked Result")).toBeVisible();
    expect(completeCallCount).toBe(2);
  });

  test("sends only one completion request when finishing is triggered twice in quick succession", async ({
    page,
  }) => {
    const user = uniqueUser();
    await registerAndLogin(page, user);

    const quiz = await createQuizViaApi(page, {
      title: uniqueTitle("Double Finish Quiz"),
      questions: [{ text: "Only question", choices: ["Choice A", "Choice B"] }],
    });
    const attempt = await startAttemptViaApi(page, quiz.id);
    const question = quiz.questions![0]!;
    const choice = question.choices[0]!;

    await submitAnswerViaApi(page, attempt.id, question, choice);

    let completeCallCount = 0;
    await page.route("**/api/attempts/*/complete", async (route) => {
      completeCallCount++;
      await new Promise((resolve) => setTimeout(resolve, 400));
      await route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(
          mockedCompletionBody(attempt, quiz, [{ question, choice }], "You are: The Mocked Result"),
        ),
      });
    });

    await page.goto(attemptUrl(quiz.id, attempt.id));

    const finishButton = page.getByRole("button", { name: "Finish" });
    await expect(finishButton).toBeVisible();

    // Fire two click events in the same task, before React can react to the
    // first one and disable/remove the button - simulating a fast double click.
    await finishButton.evaluate((el) => {
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
      el.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true }));
    });

    await expect(page.getByRole("heading", { name: "Your result" })).toBeVisible({ timeout: 10_000 });
    expect(completeCallCount).toBe(1);
  });
});

test.describe("attempt access control", () => {
  test("hides another user's quiz attempt behind a not-found page", async ({ page, browser }) => {
    const owner = uniqueUser();
    await registerAndLogin(page, owner);

    const quiz = await createQuizViaApi(page, {
      title: uniqueTitle("Private Attempt Quiz"),
      questions: [{ text: "Owner-only question", choices: ["Choice 1", "Choice 2"] }],
    });
    const attempt = await startAttemptViaApi(page, quiz.id);

    const intruderContext = await browser.newContext();
    const intruderPage = await intruderContext.newPage();
    try {
      const intruder = uniqueUser();
      await registerAndLogin(intruderPage, intruder);

      await intruderPage.goto(attemptUrl(quiz.id, attempt.id));
      await expect(intruderPage.getByText(/could not be found/i)).toBeVisible();
    } finally {
      await intruderContext.close();
    }
  });
});
