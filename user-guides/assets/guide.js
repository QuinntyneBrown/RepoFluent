/*
 * RepoFluent user guide — documentation chrome.
 *
 * One registry drives the sidebar navigation, the breadcrumb trail, the
 * previous/next pager, and the Ctrl+K search. Every page is a standalone HTML
 * file, so the script derives its own relative depth from the page slug and
 * works when the site is opened directly from disk over file://.
 */
(() => {
  "use strict";

  const DESIGN_SYSTEM_VERSION = "0.1.0";

  // Registry order is the reading order. Adding a page here adds it to the
  // navigation, the search index, and the pager.
  const pages = [
    {
      category: "Start here",
      slug: "index",
      title: "About this guide",
      icon: "home",
      description: "What RepoFluent does and how to read this guide",
      keywords: "overview introduction roles start reading path",
    },
    {
      category: "Start here",
      slug: "getting-started/requirements",
      title: "Before you begin",
      icon: "shell",
      description: "Browsers, screen sizes, and what you need to have ready",
      keywords: "browser support chrome firefox safari webgpu zoom setup",
    },
    {
      category: "Start here",
      slug: "getting-started/first-sign-in",
      title: "Opening RepoFluent",
      icon: "user",
      description: "The development banner and choosing your persona",
      keywords: "sign in login persona identity author reviewer learner",
    },
    {
      category: "Start here",
      slug: "getting-started/workspace-tour",
      title: "Tour of the workspace",
      icon: "navigation",
      description: "Every part of the application frame, named",
      keywords: "header sidebar activity bar status bar navigation shell",
    },
    {
      category: "Start here",
      slug: "getting-started/first-walkthrough",
      title: "Your first curriculum",
      icon: "play",
      description: "Upload, review, publish, assign, and learn in one pass",
      keywords: "walkthrough tutorial golden path end to end first time",
    },
    {
      category: "For learners",
      slug: "learners/my-learning",
      title: "My learning",
      icon: "dashboard",
      description: "Reading your assignments and starting a course",
      keywords: "assignments dashboard required optional next action learner",
    },
    {
      category: "For learners",
      slug: "learners/courses-and-lessons",
      title: "Courses and lessons",
      icon: "book",
      description: "Outlines, objectives, and every kind of lesson block",
      keywords: "course lesson module objective block prose callout diagram",
    },
    {
      category: "For learners",
      slug: "learners/source-context",
      title: "Reading source context",
      icon: "code",
      description: "Opening the code behind a lesson without losing your place",
      keywords: "code reference source drawer split provenance commit excerpt",
    },
    {
      category: "For authors",
      slug: "authors/upload-a-package",
      title: "Uploading a package",
      icon: "upload",
      description: "Submitting a curriculum package and reading the receipt",
      keywords: "upload package json receipt validation author checksum retry",
    },
    {
      category: "For reviewers",
      slug: "reviewers/review-a-draft",
      title: "Reviewing a draft",
      icon: "eye",
      description:
        "Preview safeguards, warning gates, and recording a decision",
      keywords: "review preview approve reject warning acknowledge rationale",
    },
    {
      category: "For administrators",
      slug: "administrators/publish-and-assign",
      title: "Publishing and assigning",
      icon: "check",
      description: "Turning an approved draft into learning someone can open",
      keywords: "publish assign administrator immutable version learner",
    },
    {
      category: "Reference",
      slug: "reference/validation-issues",
      title: "Validation issues",
      icon: "warning",
      description: "Every code you can see, what caused it, and what to do",
      keywords: "validation error warning code json path CIC CLI reject fix",
    },
    {
      category: "Reference",
      slug: "reference/lifecycle-and-evidence",
      title: "Lifecycle and evidence",
      icon: "status",
      description: "States, timelines, checksums, and correlation identifiers",
      keywords: "lifecycle state draft approved published retired audit trail",
    },
    {
      category: "Reference",
      slug: "reference/roles-and-permissions",
      title: "Roles and permissions",
      icon: "lock",
      description: "Who can do what, and why a button is not there",
      keywords: "role permission persona allowed actions author reviewer",
    },
    {
      category: "Reference",
      slug: "reference/accessibility-and-preferences",
      title: "Accessibility and preferences",
      icon: "accessibility",
      description: "Keyboard use, reduced motion, zoom, and display options",
      keywords: "accessibility keyboard focus screen reader motion zoom theme",
    },
    {
      category: "Advanced",
      slug: "advanced/compare-versions",
      title: "Comparing versions",
      icon: "table",
      description: "Seeing what changed between two published versions",
      keywords: "compare diff version semantic change refresh learner credit",
    },
    {
      category: "Advanced",
      slug: "advanced/retire-a-version",
      title: "Retiring a version",
      icon: "clock",
      description: "Withdrawing content without breaking existing learners",
      keywords: "retire retirement withdraw continue access history reason",
    },
    {
      category: "Advanced",
      slug: "advanced/audit-and-support",
      title: "Audit and support",
      icon: "file",
      description: "Reading the history trail and escalating a problem",
      keywords: "audit auditor history correlation support evidence read only",
    },
    {
      category: "Advanced",
      slug: "advanced/curriculum-contract",
      title: "The curriculum contract",
      icon: "panel",
      description: "Release checksums, artifacts, and the migration policy",
      keywords: "contract schema release artifact checksum compatibility icd",
    },
    {
      category: "Advanced",
      slug: "advanced/authoring-kit",
      title: "The authoring kit",
      icon: "terminal",
      description: "Preparing and validating a package before you upload it",
      keywords: "authoring kit offline validate preflight identities evidence",
    },
    {
      category: "Advanced",
      slug: "advanced/troubleshooting",
      title: "Troubleshooting",
      icon: "error",
      description: "Symptoms, causes, and the fix for each one",
      keywords: "troubleshooting problem error stuck conflict 401 403 404 409",
    },
  ];

  const iconPaths = {
    home: '<path d="M3 10.5 10 4l7 6.5V18H6v-7.5"/><path d="M8.5 18v-5h3v5"/>',
    shell:
      '<rect x="2" y="3" width="16" height="14"/><path d="M2 7h16M6 7v10M2 15h16"/>',
    user: '<circle cx="10" cy="7" r="3"/><path d="M4 17a6 6 0 0 1 12 0"/>',
    navigation:
      '<rect x="3" y="3" width="14" height="14"/><path d="M7 3v14M7 7h10"/>',
    play: '<path d="m7 4 9 6-9 6V4Z"/>',
    dashboard:
      '<rect x="3" y="3" width="6" height="6"/><rect x="11" y="3" width="6" height="10"/><rect x="3" y="11" width="6" height="6"/><path d="M11 15h6"/>',
    book: '<path d="M3 4h5a2 2 0 0 1 2 2v11a2 2 0 0 0-2-2H3zM17 4h-5a2 2 0 0 0-2 2v11a2 2 0 0 1 2-2h5z"/>',
    code: '<path d="m7 6-4 4 4 4M13 6l4 4-4 4M11 4 9 16"/>',
    upload: '<path d="M4 14v3h12v-3M10 14V3M6 7l4-4 4 4"/>',
    eye: '<path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z"/><circle cx="10" cy="10" r="2"/>',
    check: '<path d="m4 10 4 4 8-8"/>',
    warning: '<path d="m10 3 8 14H2L10 3Z"/><path d="M10 8v4M10 14h.01"/>',
    status: '<circle cx="10" cy="10" r="7"/><path d="m6.5 10 2.2 2.2 4.8-5"/>',
    lock: '<rect x="4" y="8" width="12" height="9" rx="1"/><path d="M7 8V6a3 3 0 0 1 6 0v2"/>',
    accessibility:
      '<circle cx="10" cy="4" r="1.5"/><path d="M4 7h12M10 7v10M7 17l3-5 3 5M6 10l4 2 4-2"/>',
    table:
      '<rect x="3" y="3" width="14" height="14"/><path d="M3 7h14M3 12h14M8 3v14"/>',
    clock: '<circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/>',
    file: '<path d="M5 3h7l3 3v11H5zM12 3v4h4"/>',
    panel:
      '<rect x="3" y="3" width="14" height="14"/><path d="M3 7h14M11 7v10"/>',
    terminal:
      '<rect x="3" y="4" width="14" height="12"/><path d="m6 8 2 2-2 2M10 13h4"/>',
    error:
      '<circle cx="10" cy="10" r="7"/><path d="m7.5 7.5 5 5M12.5 7.5l-5 5"/>',
    search: '<circle cx="8.5" cy="8.5" r="5"/><path d="m12.5 12.5 4 4"/>',
    menu: '<path d="M3 5h14M3 10h14M3 15h14"/>',
    info: '<circle cx="10" cy="10" r="7"/><path d="M10 9v5M10 6h.01"/>',
    copy: '<rect x="6" y="6" width="10" height="10"/><path d="M13 6V3H3v10h3"/>',
    external: '<path d="M11 3h6v6M10 10l7-7M16 12v5H3V4h5"/>',
    motion:
      '<path d="M3 6h8M3 10h13M3 14h10"/><path d="m14 4 3 2-3 2M13 12l3 2-3 2"/>',
    palette:
      '<path d="M10 3a7 7 0 1 0 0 14h1.2a1.3 1.3 0 0 0 .4-2.5 1.8 1.8 0 0 1 1.1-3.4H14A3 3 0 0 0 17 8c0-2.8-3.1-5-7-5Z"/><path d="M6.5 8h.01M8.5 5.8h.01M12 5.8h.01"/>',
    "arrow-right": '<path d="M3 10h14M12 5l5 5-5 5"/>',
  };

  function icon(name, label = "") {
    const hidden = label ? "" : ' aria-hidden="true"';
    const title = label ? `<title>${label}</title>` : "";
    const path = iconPaths[name] || iconPaths.file;
    return `<svg class="rf-icon" viewBox="0 0 20 20"${hidden}>${title}${path}</svg>`;
  }

  window.rfIcon = icon;

  const body = document.body;
  const slug = body.dataset.page || "index";
  const depth = slug.includes("/") ? "../" : "";
  const index = pages.findIndex((page) => page.slug === slug);
  const current = index >= 0 ? pages[index] : null;

  function href(pageSlug) {
    return `${depth}${pageSlug}.html`;
  }

  /* Display preferences ---------------------------------------------------- */

  const root = document.documentElement;
  root.dataset.rfDesignSystemVersion = DESIGN_SYSTEM_VERSION;

  function readStored(key, fallback) {
    try {
      return window.localStorage.getItem(key) || fallback;
    } catch {
      return fallback;
    }
  }
  function writeStored(key, value) {
    try {
      window.localStorage.setItem(key, value);
    } catch {
      /* Storage is unavailable over file:// in some browsers. */
    }
  }

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)",
  ).matches;
  let theme = readStored("repofluent-guide-theme", "default");
  let motion = readStored(
    "repofluent-guide-motion",
    prefersReducedMotion ? "reduced" : "full",
  );

  function applyPreferences() {
    root.dataset.rfTheme = theme;
    root.dataset.rfMotion = motion;
    const themeButton = document.querySelector("[data-theme-toggle]");
    if (themeButton) {
      themeButton.setAttribute("aria-pressed", String(theme === "tenant"));
      themeButton.setAttribute(
        "aria-label",
        theme === "tenant"
          ? "Switch to the default RepoFluent theme"
          : "Switch to the tenant theme",
      );
    }
    const motionButton = document.querySelector("[data-motion-toggle]");
    if (motionButton) {
      motionButton.setAttribute("aria-pressed", String(motion === "reduced"));
      motionButton.setAttribute(
        "aria-label",
        motion === "reduced"
          ? "Allow animation on this guide"
          : "Reduce animation on this guide",
      );
    }
  }

  /* Header ----------------------------------------------------------------- */

  const header = document.querySelector("[data-ug-header]");
  if (header) {
    header.innerHTML = `
      <a class="ug-brand" href="${href("index")}"><span class="ug-brand__mark" aria-hidden="true">R<span>F</span></span><strong>RepoFluent</strong><small>USER GUIDE</small></a>
      <button class="ug-search-trigger" type="button" data-search-open aria-haspopup="dialog">${icon("search")}<span>Search the user guide…</span><kbd>Ctrl K</kbd></button>
      <div class="ug-header__meta">
        <button class="rf-icon-button rf-button--ghost" type="button" data-theme-toggle aria-pressed="false" aria-label="Switch to the tenant theme">${icon("palette")}</button>
        <button class="rf-icon-button rf-button--ghost" type="button" data-motion-toggle aria-pressed="false" aria-label="Reduce animation on this guide">${icon("motion")}</button>
        <span>guide v0.1</span>
      </div>
      <button class="rf-icon-button rf-button--ghost ug-menu-button" type="button" data-nav-toggle aria-label="Open guide navigation" aria-expanded="false">${icon("menu")}</button>`;
  }

  applyPreferences();

  document
    .querySelector("[data-theme-toggle]")
    ?.addEventListener("click", () => {
      theme = theme === "tenant" ? "default" : "tenant";
      writeStored("repofluent-guide-theme", theme);
      applyPreferences();
    });
  document
    .querySelector("[data-motion-toggle]")
    ?.addEventListener("click", () => {
      motion = motion === "reduced" ? "full" : "reduced";
      writeStored("repofluent-guide-motion", motion);
      applyPreferences();
    });

  /* Sidebar navigation ----------------------------------------------------- */

  const nav = document.querySelector("[data-ug-nav]");
  if (nav) {
    const groups = [...new Set(pages.map((page) => page.category))];
    nav.innerHTML = groups
      .map((group) => {
        const links = pages
          .filter((page) => page.category === group)
          .map((page) => {
            const marker = page.slug === slug ? ' aria-current="page"' : "";
            return `<a href="${href(page.slug)}"${marker}>${icon(page.icon)}<span>${page.title}</span></a>`;
          })
          .join("");
        return `<div class="ug-nav__group"><div class="ug-nav__heading">${group}</div>${links}</div>`;
      })
      .join("");
  }

  /* Breadcrumbs ------------------------------------------------------------ */

  const breadcrumbs = document.querySelector("[data-ug-breadcrumbs]");
  if (breadcrumbs && current) {
    const trail = [`<a href="${href("index")}">user-guide</a>`];
    if (current.slug !== "index") {
      trail.push(`<span>${current.category.toLowerCase()}</span>`);
      trail.push(`<strong>${current.title}</strong>`);
    } else {
      trail.push("<strong>About this guide</strong>");
    }
    breadcrumbs.innerHTML = trail.join('<span aria-hidden="true">›</span>');
  }

  /* Status bar ------------------------------------------------------------- */

  const status = document.querySelector("[data-ug-status]");
  if (status) {
    status.innerHTML = `<span class="ug-statusbar__brand">RF</span><span>user-guide</span><span>${current ? current.category : "guide"}</span><span>WCAG 2.2 AA</span><span>design system ${DESIGN_SYSTEM_VERSION}</span>`;
  }

  /* Section anchors and on-page contents ----------------------------------- */

  const sections = [...document.querySelectorAll(".ug-section[id]")];
  sections.forEach((section) => {
    const heading = section.querySelector(":scope > h2");
    if (!heading || heading.querySelector("a")) return;
    const label = heading.textContent.trim();
    heading.insertAdjacentHTML(
      "beforeend",
      `<a href="#${section.id}" aria-label="Link to ${label}">#</a>`,
    );
  });

  const toc = document.querySelector("[data-ug-toc]");
  if (toc) {
    const entries = sections
      .map((section) => {
        const heading = section.querySelector(":scope > h2");
        if (!heading) return "";
        const label = heading.textContent.trim().replace(/#$/, "");
        return `<li><a href="#${section.id}">${label}</a></li>`;
      })
      .join("");
    if (entries) {
      toc.innerHTML = `<span class="ug-toc__label">On this page</span><ol>${entries}</ol>`;
    } else {
      toc.remove();
    }
  }

  /* Previous / next pager -------------------------------------------------- */

  const pager = document.querySelector("[data-ug-pager]");
  if (pager && index >= 0) {
    const previous = pages[index - 1];
    const next = pages[index + 1];
    const parts = [];
    if (previous) {
      parts.push(
        `<a href="${href(previous.slug)}" rel="prev"><small>Previous</small><strong>${previous.title}</strong></a>`,
      );
    }
    if (next) {
      parts.push(
        `<a href="${href(next.slug)}" rel="next"><small>Next</small><strong>${next.title}</strong></a>`,
      );
    }
    if (parts.length) {
      pager.innerHTML = parts.join("");
    } else {
      pager.remove();
    }
  }

  /* Mobile navigation ------------------------------------------------------ */

  const sidebar = document.querySelector(".ug-sidebar");
  const navToggle = document.querySelector("[data-nav-toggle]");
  navToggle?.addEventListener("click", () => {
    const open = sidebar?.dataset.open !== "true";
    if (sidebar) sidebar.dataset.open = String(open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute(
      "aria-label",
      `${open ? "Close" : "Open"} guide navigation`,
    );
  });
  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a") && sidebar) sidebar.dataset.open = "false";
  });

  /* Toast and copy --------------------------------------------------------- */

  function showToast(message) {
    let live = document.querySelector(".ug-live-toast");
    if (!live) {
      live = document.createElement("div");
      live.className = "ug-live-toast rf-toast";
      live.setAttribute("role", "status");
      document.body.append(live);
    }
    live.textContent = `✓ ${message}`;
    live.hidden = false;
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(() => {
      live.hidden = true;
    }, 2600);
  }

  document.querySelectorAll("[data-copy]").forEach((button) =>
    button.addEventListener("click", async () => {
      const value =
        button.dataset.copy ||
        button.closest("[data-copy-source]")?.querySelector("code")
          ?.textContent ||
        "";
      try {
        await navigator.clipboard.writeText(value);
        showToast(`Copied: ${value}`);
      } catch {
        showToast(`Copy this value: ${value}`);
      }
    }),
  );

  /* Search ----------------------------------------------------------------- */

  const searchDialog = document.createElement("div");
  searchDialog.className = "ug-search";
  searchDialog.hidden = true;
  searchDialog.setAttribute("role", "dialog");
  searchDialog.setAttribute("aria-modal", "true");
  searchDialog.setAttribute("aria-labelledby", "ug-search-title");
  searchDialog.innerHTML = `<div class="ug-search__box"><div class="ug-search__input">${icon("search")}<label class="rf-visually-hidden" id="ug-search-title" for="ug-search-input">Search the user guide</label><input id="ug-search-input" type="search" placeholder="Type a task, page, or error code…" autocomplete="off"><kbd>ESC</kbd></div><div class="ug-search__results" data-search-results></div></div>`;
  document.body.append(searchDialog);
  const searchInput = searchDialog.querySelector("input");
  const searchResults = searchDialog.querySelector("[data-search-results]");
  let searchReturnFocus;

  function renderSearch(query = "") {
    const normalized = query.trim().toLowerCase();
    const matches = pages.filter((page) =>
      `${page.category} ${page.title} ${page.description} ${page.keywords}`
        .toLowerCase()
        .includes(normalized),
    );
    searchResults.innerHTML = matches.length
      ? matches
          .map(
            (page) =>
              `<a href="${href(page.slug)}">${icon(page.icon)}<span><strong>${page.title}</strong><br><small>${page.description}</small></span><kbd>${page.category}</kbd></a>`,
          )
          .join("")
      : '<div class="ug-search__empty">No guide page matches that. Try a role name, an error code, or a task.</div>';
  }
  function openSearch() {
    searchReturnFocus = document.activeElement;
    searchDialog.hidden = false;
    searchInput.value = "";
    renderSearch();
    requestAnimationFrame(() => searchInput.focus());
  }
  function closeSearch() {
    if (searchDialog.hidden) return;
    searchDialog.hidden = true;
    searchReturnFocus?.focus();
  }
  document
    .querySelector("[data-search-open]")
    ?.addEventListener("click", openSearch);
  searchDialog.addEventListener("click", (event) => {
    if (event.target === searchDialog) closeSearch();
  });
  searchInput.addEventListener("input", () => renderSearch(searchInput.value));

  searchDialog.addEventListener("keydown", (event) => {
    if (event.key !== "Tab") return;
    const focusable = [
      ...searchDialog.querySelectorAll(
        'button, [href], input, [tabindex]:not([tabindex="-1"])',
      ),
    ].filter((item) => !item.hidden && item.getClientRects().length);
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable.at(-1);
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
      return;
    }
    if (event.key !== "Escape") return;
    closeSearch();
    if (sidebar?.dataset.open === "true") {
      sidebar.dataset.open = "false";
      navToggle?.setAttribute("aria-expanded", "false");
      navToggle?.focus();
    }
  });
})();
