import { expect, test } from "@playwright/test";

const CSS_ISSUER = "http://localhost:3000";
const TEST_EMAIL = "tester@example.com";
const TEST_PASSWORD = "password123";
const POD_EVENTS_URL = "http://localhost:3000/calibrate-test/calibrate/events/";
const EVENT_TITLE = "Pod sync integration event";
const EVENT_BODY = "Recorded during the automated browser integration test.";

async function maybeApproveConsent(page: import("@playwright/test").Page) {
  const approveButton = page
    .getByRole("button", { name: /authorize|allow|accept|continue/i })
    .first();

  try {
    await approveButton.waitFor({ state: "visible", timeout: 5_000 });
    await approveButton.click();
  } catch {
    // No consent page was shown.
  }
}

test("connects to the local pod and syncs a saved event", async ({ page, context }) => {
  await page.goto("/storage");

  await page.getByLabel(/identity provider/i).fill(CSS_ISSUER);
  await page.getByRole("button", { name: /connect to solid pod/i }).click();

  await page.getByLabel(/email/i).fill(TEST_EMAIL);
  await page.getByLabel(/password/i).fill(TEST_PASSWORD);
  await page.getByRole("button", { name: /log in|login/i }).click();

  await maybeApproveConsent(page);

  await expect(page).toHaveURL(/\/storage$/);
  await expect(page.getByText(/signed in as/i)).toContainText("calibrate-test");
  await page.getByRole("link", { name: /back to events/i }).click();
  await expect(page).toHaveURL(/\/events$/);
  await page.getByRole("link", { name: /record an event/i }).first().click();
  await expect(page).toHaveURL(/\/record$/);
  await page.getByLabel(/^title$/i).fill(EVENT_TITLE);
  await page.getByLabel(/^description$/i).fill(EVENT_BODY);
  await page.getByRole("button", { name: /save event/i }).click();

  await expect(page).toHaveURL(/\/events$/);
  await expect(page.getByRole("heading", { name: EVENT_TITLE })).toBeVisible();

  await expect
    .poll(async () => {
      const containerResponse = await context.request.get(POD_EVENTS_URL, {
        headers: { Accept: "text/turtle" },
      });

      if (!containerResponse.ok()) {
        return "";
      }

      const containerBody = await containerResponse.text();
      const resourceMatch = containerBody.match(/<([^>]+\.ttl)>/);

      if (!resourceMatch?.[1]) {
        return "";
      }

      const entryResponse = await context.request.get(resourceMatch[1], {
        headers: { Accept: "text/turtle" },
      });

      if (!entryResponse.ok()) {
        return "";
      }

      return entryResponse.text();
    }, { timeout: 30_000 })
    .toContain(EVENT_TITLE);
});
