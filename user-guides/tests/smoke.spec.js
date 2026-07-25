const { test, expect } = require("@playwright/test");
const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");

test.use({ channel: "chrome" });

const root = path.resolve(__dirname, "..");
const contentFolders = [
  "getting-started",
  "learners",
  "authors",
  "reviewers",
  "administrators",
  "reference",
  "advanced",
];

const pages = [
  "index.html",
  ...contentFolders.flatMap((folder) =>
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
  test(`${relativePath} renders its chrome without page errors`, async ({
    page,
  }) => {
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(url(relativePath));

    await expect(page.locator(".ug-brand")).toContainText("RepoFluent");
    await expect(page.locator("h1")).toHaveCount(1);
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator(".ug-nav a")).toHaveCount(pages.length);
    await expect(page.locator(".ug-nav a[aria-current='page']")).toHaveCount(1);
    await expect(page.locator(".ug-statusbar")).toContainText("user-guide");
    await expect(page.locator(".ug-skip-link")).toHaveAttribute(
      "href",
      "#main-content",
    );
    await expect(page.locator("#main-content")).toHaveCount(1);
    expect(errors, relativePath).toEqual([]);
  });
}

test("404 renders the branded chrome and offers a way back", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto(url("404.html"));
  await expect(page.locator(".ug-brand")).toContainText("RepoFluent");
  await expect(page.locator("h1")).toHaveCount(1);
  await expect(
    page.getByRole("link", { name: "Go to the guide home" }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("every page in the navigation exists on disk", async ({ page }) => {
  await page.goto(url("index.html"));
  const targets = await page
    .locator(".ug-nav a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

  expect(targets.length).toBe(pages.length);
  for (const target of targets) {
    expect(fs.existsSync(path.join(root, target)), target).toBeTruthy();
  }
});

test("every authored page is registered in the navigation", async ({
  page,
}) => {
  await page.goto(url("index.html"));
  const registered = new Set(
    await page
      .locator(".ug-nav a")
      .evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
  );

  for (const relativePath of pages) {
    expect(registered.has(relativePath), relativePath).toBeTruthy();
  }
});

test("no internal link is broken", async ({ page }) => {
  const broken = [];

  for (const relativePath of [...pages, "404.html"]) {
    await page.goto(url(relativePath));
    const targets = await page
      .locator("a[href]")
      .evaluateAll((links) =>
        links
          .map((link) => link.getAttribute("href"))
          .filter(
            (href) =>
              href &&
              !href.startsWith("#") &&
              !href.startsWith("http") &&
              !href.startsWith("mailto:"),
          ),
      );

    const from = path.dirname(path.join(root, relativePath));
    for (const target of targets) {
      const [filePart, fragment] = target.split("#");
      const resolved = path.resolve(from, filePart);
      if (!fs.existsSync(resolved)) {
        broken.push(`${relativePath} -> ${target} (missing file)`);
        continue;
      }
      if (!fragment) continue;
      const contents = fs.readFileSync(resolved, "utf8");
      if (!contents.includes(`id="${fragment}"`)) {
        broken.push(`${relativePath} -> ${target} (missing anchor)`);
      }
    }
  }

  expect(broken).toEqual([]);
});

test("on-page contents links to every section", async ({ page }) => {
  await page.goto(url("reference/validation-issues.html"));
  const sectionIds = await page
    .locator(".ug-section[id]")
    .evaluateAll((sections) => sections.map((section) => section.id));
  const tocTargets = await page
    .locator(".ug-toc a")
    .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

  expect(tocTargets).toEqual(sectionIds.map((id) => `#${id}`));
});

test("the pager moves forward and back through the reading order", async ({
  page,
}) => {
  await page.goto(url("index.html"));
  await expect(page.locator(".ug-pager a")).toHaveCount(1);
  await page.locator(".ug-pager a[rel='next']").click();
  await expect(page.locator("h1")).toContainText("Before you begin");

  await expect(page.locator(".ug-pager a")).toHaveCount(2);
  await page.locator(".ug-pager a[rel='prev']").click();
  await expect(page.locator("h1")).toContainText("Learn a codebase");

  await page.goto(url("advanced/troubleshooting.html"));
  await expect(page.locator(".ug-pager a")).toHaveCount(1);
  await expect(page.locator(".ug-pager a[rel='prev']")).toBeVisible();
});

test("search filters the guide and restores focus on Escape", async ({
  page,
}) => {
  await page.goto(url("index.html"));
  const trigger = page.locator("[data-search-open]");
  await trigger.focus();
  await page.keyboard.press("Control+k");
  await expect(page.locator(".ug-search")).toBeVisible();

  await page.locator("#ug-search-input").fill("withdraw");
  await expect(page.locator(".ug-search__results a")).toHaveCount(1);
  await expect(page.locator(".ug-search__results")).toContainText(
    "Retiring a version",
  );

  await page.locator("#ug-search-input").fill("CLI_PACKAGE_VERSION_CONFLICT");
  await expect(page.locator(".ug-search__empty")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.locator(".ug-search")).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("display preferences apply the design-system contract", async ({
  page,
}) => {
  await page.goto(url("index.html"));
  const root = page.locator("html");
  await expect(root).toHaveAttribute("data-rf-design-system-version", "0.1.0");
  await expect(root).toHaveAttribute("data-rf-theme", "default");

  await page.locator("[data-theme-toggle]").click();
  await expect(root).toHaveAttribute("data-rf-theme", "tenant");

  await page.locator("[data-motion-toggle]").click();
  await expect(root).toHaveAttribute("data-rf-motion", "reduced");
});

test("reduced motion removes transition duration", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(url("index.html"));
  const durations = await page
    .locator(".ug-card")
    .first()
    .evaluate((element) => getComputedStyle(element).transitionDuration);
  expect(
    durations.split(",").every((duration) => duration.trim() === "0.001s"),
  ).toBeTruthy();
});

test("narrow viewports keep the document within the window", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  for (const relativePath of [...pages, "404.html"]) {
    await page.goto(url(relativePath));
    const overflow = await page.evaluate(
      () => document.documentElement.scrollWidth - window.innerWidth,
    );
    expect(overflow, relativePath).toBeLessThanOrEqual(1);
  }
});

test("the guide uses no hardcoded colors outside the token contract", () => {
  const stylesheet = fs.readFileSync(
    path.join(root, "assets", "guide.css"),
    "utf8",
  );
  const withoutComments = stylesheet.replace(/\/\*[\s\S]*?\*\//g, "");
  const literals = withoutComments.match(
    /#[0-9a-fA-F]{3,8}\b|\brgba?\(|\bhsla?\(/g,
  );
  expect(literals ?? []).toEqual([]);
});
