(() => {
  "use strict";

  const pages = [
    {
      category: "Overview",
      slug: "index",
      title: "Design system",
      icon: "home",
      description: "Principles, contract, and traceability",
    },
    {
      category: "Foundations",
      slug: "foundations/color",
      title: "Color",
      icon: "palette",
      description: "Surfaces, ink, status, and charts",
    },
    {
      category: "Foundations",
      slug: "foundations/typography",
      title: "Typography",
      icon: "type",
      description: "Type families, scale, and usage",
    },
    {
      category: "Foundations",
      slug: "foundations/spacing",
      title: "Spacing & density",
      icon: "spacing",
      description: "Grid, metrics, and responsive rhythm",
    },
    {
      category: "Foundations",
      slug: "foundations/elevation",
      title: "Elevation & shape",
      icon: "layers",
      description: "Depth, borders, radius, and focus",
    },
    {
      category: "Foundations",
      slug: "foundations/iconography",
      title: "Iconography",
      icon: "icons",
      description: "SVG language and semantic glyphs",
    },
    {
      category: "Foundations",
      slug: "foundations/motion",
      title: "Motion",
      icon: "motion",
      description: "Duration, easing, and reduced motion",
    },
    {
      category: "Foundations",
      slug: "foundations/accessibility",
      title: "Accessibility",
      icon: "accessibility",
      description: "WCAG 2.2 AA interaction contract",
    },
    {
      category: "Components",
      slug: "components/buttons",
      title: "Buttons",
      icon: "button",
      description: "Actions, icons, toggles, and states",
    },
    {
      category: "Components",
      slug: "components/form-controls",
      title: "Form controls",
      icon: "form",
      description: "Inputs, choices, validation, and groups",
    },
    {
      category: "Components",
      slug: "components/navigation",
      title: "Navigation",
      icon: "navigation",
      description: "Activity bars, sidebars, and breadcrumbs",
    },
    {
      category: "Components",
      slug: "components/command-menus",
      title: "Command palette & menus",
      icon: "command",
      description: "Search, commands, and contextual actions",
    },
    {
      category: "Components",
      slug: "components/toolbars-tabs",
      title: "Toolbars & tabs",
      icon: "toolbar",
      description: "Modes, document tabs, and actions",
    },
    {
      category: "Components",
      slug: "components/tree",
      title: "Tree",
      icon: "tree",
      description: "Curriculum and repository hierarchies",
    },
    {
      category: "Components",
      slug: "components/cards-panels",
      title: "Cards & panels",
      icon: "panel",
      description: "Containers, inspectors, and empty states",
    },
    {
      category: "Components",
      slug: "components/tables",
      title: "Tables",
      icon: "table",
      description: "Dense data, selection, and responsive use",
    },
    {
      category: "Components",
      slug: "components/indicators-progress",
      title: "Indicators & progress",
      icon: "status",
      description: "State, mastery, completion, and loading",
    },
    {
      category: "Components",
      slug: "components/overlays-feedback",
      title: "Overlays & feedback",
      icon: "dialog",
      description: "Dialogs, notices, toasts, and tooltips",
    },
    {
      category: "Components",
      slug: "components/learning-code",
      title: "Learning & code",
      icon: "code",
      description: "Objectives, code, glossary, and references",
    },
    {
      category: "Components",
      slug: "components/data-visualization",
      title: "Data visualization",
      icon: "chart",
      description: "Charts, legends, palettes, and alternatives",
    },
    {
      category: "Patterns",
      slug: "patterns/application-shell",
      title: "Application shell",
      icon: "shell",
      description: "Code Command frame and responsive behavior",
    },
    {
      category: "Patterns",
      slug: "patterns/learner-dashboard",
      title: "Learner dashboard",
      icon: "dashboard",
      description: "Assignments, mastery, and next actions",
    },
    {
      category: "Patterns",
      slug: "patterns/lesson-workspace",
      title: "Lesson & code workspace",
      icon: "lesson",
      description: "Learning content beside source context",
    },
    {
      category: "Patterns",
      slug: "patterns/system-map",
      title: "System map",
      icon: "map",
      description: "Architecture graph and accessible inspector",
    },
    {
      category: "Patterns",
      slug: "patterns/assessments",
      title: "Assessments",
      icon: "assessment",
      description: "Questions, attempts, feedback, and mastery",
    },
    {
      category: "Patterns",
      slug: "patterns/analytics",
      title: "Analytics & reporting",
      icon: "analytics",
      description: "Transparent measures and safe drill-down",
    },
    {
      category: "Patterns",
      slug: "patterns/curriculum-lifecycle",
      title: "Curriculum lifecycle",
      icon: "upload",
      description: "Import, validation, review, and publication",
    },
    {
      category: "Patterns",
      slug: "patterns/administration",
      title: "Administration",
      icon: "settings",
      description: "Users, groups, roles, and assignments",
    },
  ];

  const iconPaths = {
    home: '<path d="M3 10.5 10 4l7 6.5V18H6v-7.5"/><path d="M8.5 18v-5h3v5"/>',
    palette:
      '<path d="M10 3a7 7 0 1 0 0 14h1.2a1.3 1.3 0 0 0 .4-2.5 1.8 1.8 0 0 1 1.1-3.4H14A3 3 0 0 0 17 8c0-2.8-3.1-5-7-5Z"/><path d="M6.5 8h.01M8.5 5.8h.01M12 5.8h.01"/>',
    type: '<path d="M3 5V3h14v2M7 17h6M10 3v14"/>',
    spacing:
      '<path d="M4 3v14M16 3v14M7 7h6M7 13h6M9 5 7 7l2 2M11 11l2 2-2 2"/>',
    layers:
      '<path d="m10 3 7 4-7 4-7-4 7-4Z"/><path d="m3 11 7 4 7-4M3 15l7 4 7-4"/>',
    icons:
      '<rect x="3" y="3" width="6" height="6"/><circle cx="14" cy="6" r="3"/><path d="m6 12-3 5h6l-3-5ZM12 17h5v-5h-5z"/>',
    motion:
      '<path d="M3 6h8M3 10h13M3 14h10"/><path d="m14 4 3 2-3 2M13 12l3 2-3 2"/>',
    accessibility:
      '<circle cx="10" cy="4" r="1.5"/><path d="M4 7h12M10 7v10M7 17l3-5 3 5M6 10l4 2 4-2"/>',
    button:
      '<rect x="3" y="6" width="14" height="8" rx="2"/><path d="M7 10h6"/>',
    form: '<path d="M3 5h14v4H3zM3 13h6v4H3z"/><path d="m12 15 1.5 1.5L17 13"/>',
    navigation:
      '<rect x="3" y="3" width="14" height="14"/><path d="M7 3v14M7 7h10"/>',
    command:
      '<path d="M7 6H5a2 2 0 1 0 2-2v12a2 2 0 1 0-2-2h10a2 2 0 1 0-2 2V4a2 2 0 1 0 2 2H7Z"/>',
    toolbar: '<path d="M3 4h14v4H3zM3 12h4v4H3zM10 12h7v4h-7z"/>',
    tree: '<path d="M5 3v11h4M5 8h4M9 5h7v5H9zM9 12h7v5H9z"/>',
    panel:
      '<rect x="3" y="3" width="14" height="14"/><path d="M3 7h14M11 7v10"/>',
    table:
      '<rect x="3" y="3" width="14" height="14"/><path d="M3 7h14M3 12h14M8 3v14"/>',
    status: '<circle cx="10" cy="10" r="7"/><path d="m6.5 10 2.2 2.2 4.8-5"/>',
    dialog:
      '<rect x="3" y="4" width="14" height="12" rx="1"/><path d="M3 8h14M13.5 6h.01"/>',
    code: '<path d="m7 6-4 4 4 4M13 6l4 4-4 4M11 4 9 16"/>',
    chart: '<path d="M3 17V3M3 17h14M6 14v-4M10 14V6M14 14V8"/>',
    shell:
      '<rect x="2" y="3" width="16" height="14"/><path d="M2 7h16M6 7v10M2 15h16"/>',
    dashboard:
      '<rect x="3" y="3" width="6" height="6"/><rect x="11" y="3" width="6" height="10"/><rect x="3" y="11" width="6" height="6"/><path d="M11 15h6"/>',
    lesson: '<path d="M4 3h9l3 3v11H4z"/><path d="M13 3v4h4M7 10h6M7 13h5"/>',
    map: '<circle cx="5" cy="10" r="2"/><circle cx="15" cy="5" r="2"/><circle cx="15" cy="15" r="2"/><path d="m7 9 6-3M7 11l6 3"/>',
    assessment:
      '<path d="M5 3h10v14H5zM8 3v2h4V3"/><path d="m8 10 1.5 1.5L13 8"/>',
    analytics: '<path d="M3 17V9h3v8M8.5 17V4h3v13M14 17v-6h3v6"/>',
    upload: '<path d="M4 14v3h12v-3M10 14V3M6 7l4-4 4 4"/>',
    settings:
      '<circle cx="10" cy="10" r="2.5"/><path d="M10 3v2M10 15v2M3 10h2M15 10h2M5 5l1.4 1.4M13.6 13.6 15 15M15 5l-1.4 1.4M6.4 13.6 5 15"/>',
    search: '<circle cx="8.5" cy="8.5" r="5"/><path d="m12.5 12.5 4 4"/>',
    menu: '<path d="M3 5h14M3 10h14M3 15h14"/>',
    copy: '<rect x="6" y="6" width="10" height="10"/><path d="M13 6V3H3v10h3"/>',
    check: '<path d="m4 10 4 4 8-8"/>',
    info: '<circle cx="10" cy="10" r="7"/><path d="M10 9v5M10 6h.01"/>',
    warning: '<path d="m10 3 8 14H2L10 3Z"/><path d="M10 8v4M10 14h.01"/>',
    error:
      '<circle cx="10" cy="10" r="7"/><path d="m7.5 7.5 5 5M12.5 7.5l-5 5"/>',
    chevron: '<path d="m7 4 6 6-6 6"/>',
    file: '<path d="M5 3h7l3 3v11H5zM12 3v4h4"/>',
    book: '<path d="M3 4h5a2 2 0 0 1 2 2v11a2 2 0 0 0-2-2H3zM17 4h-5a2 2 0 0 0-2 2v11a2 2 0 0 1 2-2h5z"/>',
    terminal:
      '<rect x="3" y="4" width="14" height="12"/><path d="m6 8 2 2-2 2M10 13h4"/>',
    user: '<circle cx="10" cy="7" r="3"/><path d="M4 17a6 6 0 0 1 12 0"/>',
    close: '<path d="m5 5 10 10M15 5 5 15"/>',
    external: '<path d="M11 3h6v6M10 10l7-7M16 12v5H3V4h5"/>',
    bell: '<path d="M5 14h10l-1.5-2V8a3.5 3.5 0 0 0-7 0v4L5 14ZM8.5 17h3"/>',
    clock: '<circle cx="10" cy="10" r="7"/><path d="M10 6v4l3 2"/>',
    filter: '<path d="M3 4h14l-5.5 6v5l-3 2v-7L3 4Z"/>',
    download: '<path d="M4 15v2h12v-2M10 3v10M6 9l4 4 4-4"/>',
    more: '<circle cx="4" cy="10" r="1"/><circle cx="10" cy="10" r="1"/><circle cx="16" cy="10" r="1"/>',
    play: '<path d="m7 4 9 6-9 6V4Z"/>',
    "arrow-right": '<path d="M3 10h14M12 5l5 5-5 5"/>',
    eye: '<path d="M2 10s3-5 8-5 8 5 8 5-3 5-8 5-8-5-8-5Z"/><circle cx="10" cy="10" r="2"/>',
    lock: '<rect x="4" y="8" width="12" height="9" rx="1"/><path d="M7 8V6a3 3 0 0 1 6 0v2"/>',
  };

  function icon(name, label = "") {
    const hidden = label ? "" : ' aria-hidden="true"';
    const title = label ? `<title>${label}</title>` : "";
    return `<svg class="rf-icon" viewBox="0 0 20 20"${hidden}>${title}${iconPaths[name] || iconPaths.file}</svg>`;
  }

  window.rfIcon = icon;

  const body = document.body;
  const category = body.dataset.category || "Overview";
  const slug = body.dataset.page || "index";
  const depth = slug.includes("/") ? "../" : "";

  const header = document.querySelector("[data-ds-header]");
  if (header) {
    header.innerHTML = `
      <a class="ds-brand" href="${depth}index.html"><span class="ds-brand__mark">R<span>F</span></span><strong>RepoFluent</strong><small>SYSTEM</small></a>
      <button class="ds-search-trigger" type="button" data-search-open aria-haspopup="dialog">${icon("search")}<span>Search tokens, components, patterns…</span><kbd>Ctrl K</kbd></button>
      <div class="ds-header__meta"><span class="rf-status rf-status--success">contract active</span><span>v0.1</span></div>
      <button class="rf-icon-button rf-button--ghost ds-menu-button" type="button" data-nav-toggle aria-label="Open documentation navigation" aria-expanded="false">${icon("menu")}</button>`;
  }

  const nav = document.querySelector("[data-ds-nav]");
  if (nav) {
    const groups = [...new Set(pages.map((page) => page.category))];
    nav.innerHTML = groups
      .map((group) => {
        const links = pages
          .filter((page) => page.category === group)
          .map((page) => {
            const href = `${depth}${page.slug}.html`;
            const current = page.slug === slug ? ' aria-current="page"' : "";
            return `<a href="${href}"${current}>${icon(page.icon)}<span>${page.title}</span></a>`;
          })
          .join("");
        return `<div class="ds-nav__group"><div class="ds-nav__heading">${group}</div>${links}</div>`;
      })
      .join("");
  }

  const status = document.querySelector("[data-ds-status]");
  if (status)
    status.innerHTML =
      '<span class="ds-statusbar__brand">RF</span><span>design-system*</span><span>0 errors</span><span>WCAG 2.2 AA</span><span>HTML · CSS · JS</span>';

  document.querySelectorAll(".ds-section[id]").forEach((section) => {
    const heading = section.querySelector(":scope > h2");
    if (heading && !heading.querySelector("a"))
      heading.insertAdjacentHTML(
        "beforeend",
        `<a href="#${section.id}" aria-label="Link to ${heading.textContent.trim()}">#</a>`,
      );
  });

  const sidebar = document.querySelector(".ds-sidebar");
  const navToggle = document.querySelector("[data-nav-toggle]");
  navToggle?.addEventListener("click", () => {
    const open = sidebar?.dataset.open !== "true";
    if (sidebar) sidebar.dataset.open = String(open);
    navToggle.setAttribute("aria-expanded", String(open));
    navToggle.setAttribute(
      "aria-label",
      `${open ? "Close" : "Open"} documentation navigation`,
    );
  });
  nav?.addEventListener("click", (event) => {
    if (event.target.closest("a") && sidebar) sidebar.dataset.open = "false";
  });

  function showToast(message) {
    let live = document.querySelector(".ds-live-toast");
    if (!live) {
      live = document.createElement("div");
      live.className = "ds-live-toast rf-toast";
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
  window.rfShowToast = showToast;

  document.querySelectorAll("[data-copy]").forEach((button) =>
    button.addEventListener("click", async () => {
      const value =
        button.dataset.copy ||
        button.closest("tr")?.querySelector("code")?.textContent ||
        "";
      try {
        await navigator.clipboard.writeText(value);
        showToast(`COPIED: ${value}`);
      } catch {
        showToast(`COPY VALUE: ${value}`);
      }
    }),
  );

  const searchDialog = document.createElement("div");
  searchDialog.className = "ds-search";
  searchDialog.hidden = true;
  searchDialog.setAttribute("role", "dialog");
  searchDialog.setAttribute("aria-modal", "true");
  searchDialog.setAttribute("aria-labelledby", "ds-search-title");
  searchDialog.innerHTML = `<div class="ds-search__box"><div class="ds-search__input">${icon("search")}<label class="rf-visually-hidden" id="ds-search-title" for="ds-search-input">Search design system</label><input id="ds-search-input" type="search" placeholder="Type a page, component, or pattern…" autocomplete="off"><kbd>ESC</kbd></div><div class="ds-search__results"></div></div>`;
  document.body.append(searchDialog);
  const searchInput = searchDialog.querySelector("input");
  const searchResults = searchDialog.querySelector(".ds-search__results");
  let searchReturnFocus;

  function renderSearch(query = "") {
    const normalized = query.trim().toLowerCase();
    const matches = pages.filter((page) =>
      `${page.category} ${page.title} ${page.description}`
        .toLowerCase()
        .includes(normalized),
    );
    searchResults.innerHTML = matches.length
      ? matches
          .map(
            (page) =>
              `<a href="${depth}${page.slug}.html">${icon(page.icon)}<span><strong>${page.title}</strong><br><small>${page.description}</small></span><kbd>${page.category}</kbd></a>`,
          )
          .join("")
      : '<div class="ds-search__empty">No matching design-system page.</div>';
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

  function trapFocus(container, event) {
    if (event.key !== "Tab") return;
    const focusable = [
      ...container.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
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
  }
  searchDialog.addEventListener("keydown", (event) =>
    trapFocus(searchDialog, event),
  );

  document.addEventListener("keydown", (event) => {
    if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
      event.preventDefault();
      openSearch();
    }
    if (event.key === "Escape") {
      closeSearch();
      document
        .querySelectorAll(".rf-dialog-backdrop:not([hidden])")
        .forEach((dialog) => closeDialog(dialog));
      if (sidebar?.dataset.open === "true") {
        sidebar.dataset.open = "false";
        navToggle?.setAttribute("aria-expanded", "false");
        navToggle?.focus();
      }
    }
  });

  document.querySelectorAll("[data-demo-tabs]").forEach((tabset) => {
    const tabs = [...tabset.querySelectorAll('[role="tab"]')];
    const panels = tabs.map((tab) =>
      document.getElementById(tab.getAttribute("aria-controls")),
    );
    function activate(tab, focus = false) {
      tabs.forEach((item, index) => {
        const active = item === tab;
        item.setAttribute("aria-selected", String(active));
        item.tabIndex = active ? 0 : -1;
        if (panels[index]) panels[index].hidden = !active;
      });
      if (focus) tab.focus();
    }
    tabs.forEach((tab) => {
      tab.addEventListener("click", () => activate(tab));
      tab.addEventListener("keydown", (event) => {
        const index = tabs.indexOf(tab);
        if (event.key === "ArrowRight") {
          event.preventDefault();
          activate(tabs[(index + 1) % tabs.length], true);
        }
        if (event.key === "ArrowLeft") {
          event.preventDefault();
          activate(tabs[(index - 1 + tabs.length) % tabs.length], true);
        }
        if (event.key === "Home") {
          event.preventDefault();
          activate(tabs[0], true);
        }
        if (event.key === "End") {
          event.preventDefault();
          activate(tabs.at(-1), true);
        }
      });
    });
  });

  document.querySelectorAll("[data-toggle-group]").forEach((group) => {
    group.addEventListener("click", (event) => {
      const button = event.target.closest("button");
      if (!button) return;
      group
        .querySelectorAll("button")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
    });
  });

  const dialogReturnFocus = new WeakMap();
  function openDialog(dialog, trigger) {
    dialogReturnFocus.set(dialog, trigger);
    dialog.hidden = false;
    requestAnimationFrame(() =>
      dialog
        .querySelector(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        )
        ?.focus(),
    );
  }
  function closeDialog(dialog) {
    dialog.hidden = true;
    dialogReturnFocus.get(dialog)?.focus();
  }
  document.querySelectorAll("[data-dialog-open]").forEach((trigger) =>
    trigger.addEventListener("click", () => {
      const dialog = document.getElementById(trigger.dataset.dialogOpen);
      if (dialog) openDialog(dialog, trigger);
    }),
  );
  document.querySelectorAll(".rf-dialog-backdrop").forEach((dialog) => {
    dialog
      .querySelectorAll("[data-dialog-close]")
      .forEach((button) =>
        button.addEventListener("click", () => closeDialog(dialog)),
      );
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) closeDialog(dialog);
    });
    dialog.addEventListener("keydown", (event) => trapFocus(dialog, event));
  });

  document
    .querySelectorAll("[data-toast]")
    .forEach((button) =>
      button.addEventListener("click", () => showToast(button.dataset.toast)),
    );

  document.querySelectorAll("[data-tree-select]").forEach((tree) => {
    tree.setAttribute("role", "tree");
    const items = [...tree.querySelectorAll(".rf-tree__item")];
    items.forEach((item) => {
      item.setAttribute("role", "treeitem");
      item.tabIndex = item.hasAttribute("aria-current") ? 0 : -1;
    });
    function visibleItems() {
      return items.filter((item) => item.getClientRects().length);
    }
    function select(item, focus = false) {
      items.forEach((candidate) => {
        candidate.removeAttribute("aria-current");
        candidate.tabIndex = candidate === item ? 0 : -1;
      });
      item.setAttribute("aria-current", "page");
      if (focus) item.focus();
    }
    tree.addEventListener("click", (event) => {
      const item = event.target.closest(".rf-tree__item");
      if (item) select(item);
    });
    tree.addEventListener("keydown", (event) => {
      const item = event.target.closest(".rf-tree__item");
      if (!item) return;
      const visible = visibleItems();
      const index = visible.indexOf(item);
      if (event.key === "ArrowDown") {
        event.preventDefault();
        select(visible[Math.min(index + 1, visible.length - 1)], true);
      }
      if (event.key === "ArrowUp") {
        event.preventDefault();
        select(visible[Math.max(index - 1, 0)], true);
      }
      if (event.key === "Home") {
        event.preventDefault();
        select(visible[0], true);
      }
      if (event.key === "End") {
        event.preventDefault();
        select(visible.at(-1), true);
      }
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        select(item);
        showToast(`OPENED: ${item.textContent.trim()}`);
      }
    });
  });

  document.querySelectorAll("[data-source-target]").forEach((button) =>
    button.addEventListener("click", () => {
      const parent = button.closest("[data-source-demo]") || document;
      parent
        .querySelectorAll("[data-source-target]")
        .forEach((item) =>
          item.setAttribute("aria-pressed", String(item === button)),
        );
      parent.querySelectorAll("[data-source-panel]").forEach((panel) => {
        panel.hidden = panel.id !== button.dataset.sourceTarget;
      });
      showToast(
        `SOURCE_OPENED: ${button.dataset.sourceFile || button.textContent.trim()}`,
      );
    }),
  );

  document.querySelectorAll("[data-graph-node]").forEach((button) =>
    button.addEventListener("click", () => {
      const graph = button.closest("[data-graph-demo]");
      graph
        ?.querySelectorAll("[data-graph-node]")
        .forEach((node) =>
          node.setAttribute("aria-pressed", String(node === button)),
        );
      const inspector = graph?.querySelector("[data-graph-inspector]");
      if (inspector) {
        inspector.querySelector("[data-node-kind]").textContent =
          button.dataset.kind || "SYSTEM_NODE";
        inspector.querySelector("[data-node-title]").textContent =
          button.dataset.title || button.textContent.trim();
        inspector.querySelector("[data-node-description]").textContent =
          button.dataset.description || "";
      }
    }),
  );
  document.querySelectorAll("[data-graph-demo]").forEach((graph) =>
    graph.addEventListener("keydown", (event) => {
      if (
        !["ArrowLeft", "ArrowRight", "ArrowUp", "ArrowDown"].includes(event.key)
      )
        return;
      const nodes = [...graph.querySelectorAll("[data-graph-node]")];
      const index = nodes.indexOf(document.activeElement);
      if (index < 0) return;
      event.preventDefault();
      const step =
        event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 1;
      nodes[(index + step + nodes.length) % nodes.length].focus();
    }),
  );

  document.querySelectorAll("[data-question-submit]").forEach((button) =>
    button.addEventListener("click", () => {
      const question = button.closest("[data-question]");
      const selected = question?.querySelector("input:checked");
      const feedback = question?.querySelector("[data-question-feedback]");
      if (!selected) {
        showToast("SELECT AN ANSWER");
        return;
      }
      const correct = selected.dataset.correct === "true";
      if (feedback) {
        feedback.hidden = false;
        feedback.className = `rf-callout ${correct ? "rf-callout--success" : "rf-callout--warning"}`;
        feedback.innerHTML = `${icon(correct ? "check" : "warning")}<div><strong>${correct ? "Correct" : "Review this concept"}</strong><p>${correct ? "The API persists the order before publishing the durable event." : "Return to the lesson section on the synchronous-to-asynchronous boundary."}</p></div>`;
      }
      button.textContent = correct ? "CONTINUE" : "REVIEW LESSON";
    }),
  );

  document.querySelectorAll("[data-progress-demo]").forEach((button) =>
    button.addEventListener("click", () => {
      const progress = button
        .closest(".ds-example")
        ?.querySelector(".rf-progress__fill");
      const meta = button
        .closest(".ds-example")
        ?.querySelector("[data-progress-value]");
      if (progress)
        progress.style.width = progress.style.width === "100%" ? "68%" : "100%";
      if (meta) meta.textContent = progress?.style.width || "100%";
      showToast(
        progress?.style.width === "100%"
          ? "LESSON COMPLETED"
          : "LESSON REOPENED",
      );
    }),
  );
})();
