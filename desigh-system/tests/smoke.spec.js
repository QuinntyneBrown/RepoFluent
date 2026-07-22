const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

test.use({ channel: "chrome" });

const root = path.resolve(__dirname, "..");
const pages = [
  "index.html",
  ...["foundations", "components", "patterns"].flatMap((folder) =>
    fs
      .readdirSync(path.join(root, folder))
      .filter((file) => file.endsWith(".html"))
      .map((file) => `${folder}/${file}`),
  ),
];

function url(relativePath) {
  return pathToFileURL(path.join(root, relativePath)).href;
}

for (const relativePath of pages) {
  test(`${relativePath} loads without page errors`, async ({ page }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url(relativePath));
    await expect(page.locator(".ds-brand")).toContainText("RepoFluent");
    await expect(page.locator("h1").first()).toBeVisible();
    expect(errors).toEqual([]);
  });
}

test("global command search filters and restores focus", async ({ page }) => {
  await page.goto(url("index.html"));
  const trigger = page.locator("[data-search-open]");
  await trigger.focus();
  await page.keyboard.press("Control+k");
  await expect(page.locator(".ds-search")).toBeVisible();
  await page.locator("#ds-search-input").fill("assessment");
  await expect(page.locator(".ds-search__results a")).toHaveCount(1);
  await expect(page.locator(".ds-search__results")).toContainText(
    "Assessments",
  );
  await page.keyboard.press("Escape");
  await expect(page.locator(".ds-search")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("tabs support arrow-key selection", async ({ page }) => {
  await page.goto(url("components/toolbars-tabs.html"));
  const first = page.locator("#tab-dashboard");
  const second = page.locator("#tab-lesson");
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(second).toBeFocused();
  await expect(second).toHaveAttribute("aria-selected", "true");
  await expect(page.locator("#panel-lesson")).toBeVisible();
});

test("dialog closes with Escape and restores trigger focus", async ({
  page,
}) => {
  await page.goto(url("components/overlays-feedback.html"));
  const trigger = page.locator('[data-dialog-open="retire-dialog"]');
  await trigger.click();
  await expect(page.locator("#retire-dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("#retire-dialog")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("assessment example renders deterministic feedback", async ({ page }) => {
  await page.goto(url("patterns/assessments.html"));
  await page.locator('[data-question] input[data-correct="true"]').check();
  await page.locator("[data-question-submit]").click();
  await expect(page.locator("[data-question-feedback]")).toBeVisible();
  await expect(page.locator("[data-question-feedback]")).toContainText(
    "Correct",
  );
});

test("phone layout keeps the document within the viewport", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const relativePath of pages) {
    await page.goto(url(relativePath));
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, relativePath).toBeLessThanOrEqual(1);
  }
});
