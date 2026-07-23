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

test("default and tenant themes retain readable primary actions and visible focus", async ({
  page,
}) => {
  await page.goto(url("components/buttons.html"));

  for (const theme of ["default", "tenant"]) {
    await page.locator("html").evaluate((root, selectedTheme) => {
      root.dataset.rfTheme = selectedTheme;
    }, theme);

    const primary = page.locator(".rf-button--primary").first();
    await primary.focus();
    const ratios = await primary.evaluate((element) => {
      function luminance(color) {
        const channels = color
          .match(/\d+(?:\.\d+)?/g)
          .slice(0, 3)
          .map(Number);
        const normalized = channels.map((channel) => {
          const value = channel / 255;
          return value <= 0.04045
            ? value / 12.92
            : ((value + 0.055) / 1.055) ** 2.4;
        });
        return (
          0.2126 * normalized[0] +
          0.7152 * normalized[1] +
          0.0722 * normalized[2]
        );
      }

      function contrast(first, second) {
        const lighter = Math.max(luminance(first), luminance(second));
        const darker = Math.min(luminance(first), luminance(second));
        return (lighter + 0.05) / (darker + 0.05);
      }

      const style = getComputedStyle(element);
      return {
        focus: contrast(
          style.outlineColor,
          getComputedStyle(document.body).backgroundColor,
        ),
        text: contrast(style.color, style.backgroundColor),
      };
    });

    expect(
      ratios.text,
      `${theme} primary action contrast`,
    ).toBeGreaterThanOrEqual(4.5);
    expect(ratios.focus, `${theme} focus contrast`).toBeGreaterThanOrEqual(3);
  }
});

test("component states remain semantic at high zoom and reduced motion", async ({
  page,
}) => {
  await page.setViewportSize({ width: 640, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url("components/buttons.html"));

  const unavailable = page.getByRole("button", { name: "UNAVAILABLE" });
  const busy = page.getByRole("button", { name: "SAVING" });
  await expect(unavailable).toBeDisabled();
  await expect(busy).toHaveAttribute("aria-busy", "true");
  await expect(busy).toContainText("SAVING");

  const transitionDurations = await page
    .getByRole("button", { name: "DEFAULT" })
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(
    transitionDurations
      .split(",")
      .every((duration) => duration.trim() === "0.001s"),
  ).toBeTruthy();

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - window.innerWidth,
  );
  expect(overflow).toBeLessThanOrEqual(1);
});
