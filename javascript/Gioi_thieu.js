"use strict";

/* ── Helpers ── */
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ============================================================
   1. HAMBURGER MENU
   ============================================================ */
const hamburger = qs("#hamburger");
const mobileMenu = qs("#mobileMenu");
const navLinks = qs("#navLinks");

hamburger.addEventListener("click", () => {
  const isOpen = hamburger.classList.toggle("open");
  mobileMenu.classList.toggle("open", isOpen);
  hamburger.setAttribute("aria-expanded", isOpen);
});

// Close on nav link click (mobile)
qsa("a", mobileMenu).forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    mobileMenu.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  });
});

// Close on outside click
document.addEventListener("click", (e) => {
  if (!hamburger.contains(e.target) && !mobileMenu.contains(e.target)) {
    hamburger.classList.remove("open");
    mobileMenu.classList.remove("open");
    hamburger.setAttribute("aria-expanded", "false");
  }
});

/* ============================================================
   2. DARK MODE TOGGLE
   ============================================================ */
const themeToggle = qs("#themeToggle");
const root = document.documentElement;

// Restore saved theme
const savedTheme = localStorage.getItem("newssite-theme");
if (savedTheme) root.setAttribute("data-theme", savedTheme);

themeToggle.addEventListener("click", () => {
  const isDark = root.getAttribute("data-theme") === "dark";
  const next = isDark ? "light" : "dark";
  root.setAttribute("data-theme", next);
  localStorage.setItem("newssite-theme", next);
});

/* ============================================================
   3. SEARCH – open/close panel
   ============================================================ */
const searchToggle = qs("#searchToggle");
const searchClose = qs("#searchClose");
const searchBox = qs("#searchBox");
const searchInput = qs("#searchInput");
const searchResults = qs("#searchResults");

function openSearch() {
  searchBox.classList.add("open");
  searchInput.focus();
}

function closeSearch() {
  searchBox.classList.remove("open");
  searchResults.classList.remove("open");
  searchInput.value = "";
  qs("#resultsList").innerHTML = "";
  qs("#srEmpty").hidden = true;
}

searchToggle.addEventListener("click", (e) => {
  e.stopPropagation();
  if (searchBox.classList.contains("open")) {
    closeSearch();
  } else {
    openSearch();
  }
});

searchClose.addEventListener("click", closeSearch);

// Close on Escape
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeSearch();
});

// Prevent click inside search box from bubbling to document close
searchBox.addEventListener("click", (e) => e.stopPropagation());

/* ============================================================
   4. REAL-TIME SEARCH FILTER
   ============================================================ */

// Build search index from page sections
const searchIndex = buildIndex();

function buildIndex() {
  const sections = qsa("[data-search-section]");
  const index = [];

  // Map section IDs / titles
  const sectionMeta = {
    "about-intro": { tag: "Giới thiệu", title: "Giới thiệu về NewsSite" },
    mission: { tag: "Sứ mệnh", title: "Sứ mệnh của chúng tôi" },
    vision: { tag: "Tầm nhìn", title: "Tầm nhìn NewsSite" },
    values: { tag: "Giá trị", title: "Giá trị cốt lõi" },
    team: { tag: "Đội ngũ", title: "Đội ngũ biên tập" },
    contact: { tag: "Liên hệ", title: "Thông tin liên hệ" },
  };

  sections.forEach((el) => {
    const classList = [...el.classList];
    const sectionKey = Object.keys(sectionMeta).find((k) =>
      classList.includes(k),
    );
    const meta = sectionMeta[sectionKey] || {
      tag: "Mục",
      title: el.querySelector("h2")?.textContent || "",
    };

    index.push({
      element: el,
      tag: meta.tag,
      title: meta.title,
      keywords: (el.dataset.searchSection || "").toLowerCase(),
    });
  });

  return index;
}

function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Normalize Vietnamese (simple diacritic-insensitive compare)
function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

searchInput.addEventListener("input", () => {
  const raw = searchInput.value.trim();
  const query = normalize(raw);

  const resultsList = qs("#resultsList");
  const srEmpty = qs("#srEmpty");

  resultsList.innerHTML = "";
  srEmpty.hidden = true;

  if (!query) {
    searchResults.classList.remove("open");
    return;
  }

  searchResults.classList.add("open");

  const matches = searchIndex.filter(
    (item) =>
      normalize(item.title).includes(query) ||
      normalize(item.keywords).includes(query),
  );

  if (matches.length === 0) {
    srEmpty.hidden = false;
    return;
  }

  matches.forEach((item) => {
    const div = document.createElement("div");
    div.className = "result-item";
    div.innerHTML = `
      <span class="result-item-tag">${item.tag}</span>
      <span class="result-item-title">${highlight(item.title, raw)}</span>
    `;
    div.addEventListener("click", () => {
      closeSearch();
      item.element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Brief flash highlight
      item.element.style.outline = "2px solid var(--clr-accent)";
      item.element.style.outlineOffset = "8px";
      setTimeout(() => {
        item.element.style.outline = "";
        item.element.style.outlineOffset = "";
      }, 1400);
    });
    resultsList.appendChild(div);
  });
});

// Close search results when clicking outside
document.addEventListener("click", (e) => {
  if (
    !searchResults.contains(e.target) &&
    !qs("#searchWrap").contains(e.target)
  ) {
    searchResults.classList.remove("open");
  }
});

/* ============================================================
   5. SCROLL-TRIGGERED SECTION ANIMATIONS
   ============================================================ */
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 },
);

qsa(".section-block").forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.05}s`;
  observer.observe(el);
});
