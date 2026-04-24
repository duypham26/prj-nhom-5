"use strict";

/* ── Helpers ── */
const qs = (sel, root = document) => root.querySelector(sel);
const qsa = (sel, root = document) => [...root.querySelectorAll(sel)];

/* ============================================================
   1. HAMBURGER MENU
   ============================================================ */
const hamburger = qs("#hamburger");
const navMenu = qs("#nav-menu");

hamburger.addEventListener("click", (e) => {
  e.stopPropagation();
  const isOpen = hamburger.classList.toggle("open");
  navMenu.classList.toggle("open", isOpen);
});

// Đóng menu khi click vào link
qsa("a", navMenu).forEach((link) => {
  link.addEventListener("click", () => {
    hamburger.classList.remove("open");
    navMenu.classList.remove("open");
  });
});

// Đóng menu khi click ra ngoài
document.addEventListener("click", (e) => {
  if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
    hamburger.classList.remove("open");
    navMenu.classList.remove("open");
  }
});

/* ============================================================
   2. DARK MODE (dùng body.dark — giống thể thao)
   ============================================================ */
const switchMode = qs("#switch-mode");
const icon = switchMode.querySelector("i");

// Khôi phục trạng thái đã lưu
if (localStorage.getItem("theme") === "dark") {
  document.body.classList.add("dark");
  icon.classList.replace("bi-moon-fill", "bi-sun-fill");
}

switchMode.addEventListener("click", () => {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  icon.classList.toggle("bi-moon-fill", !isDark);
  icon.classList.toggle("bi-sun-fill", isDark);
  localStorage.setItem("theme", isDark ? "dark" : "light");
});

/* ============================================================
   3. SEARCH — tìm kiếm nội dung trong trang
   ============================================================ */
const searchInput = qs("#searchInput");
const searchBtn = qs("#searchBtn");

// Xây index từ các section có data-search-section
const searchIndex = buildIndex();

function buildIndex() {
  const sectionMeta = {
    "about-intro": { tag: "Giới thiệu", title: "Giới thiệu về Báo Mới" },
    mission: { tag: "Sứ mệnh", title: "Sứ mệnh của chúng tôi" },
    vision: { tag: "Tầm nhìn", title: "Tầm nhìn Báo Mới" },
    values: { tag: "Giá trị", title: "Giá trị cốt lõi" },
    team: { tag: "Đội ngũ", title: "Đội ngũ biên tập" },
  };

  return qsa("[data-search-section]").map((el) => {
    const key = Object.keys(sectionMeta).find((k) => el.classList.contains(k));
    const meta = sectionMeta[key] || {
      tag: "Mục",
      title: el.querySelector("h2")?.textContent || "",
    };
    return {
      element: el,
      tag: meta.tag,
      title: meta.title,
      keywords: (el.dataset.searchSection || "").toLowerCase(),
    };
  });
}

// Chuẩn hoá tiếng Việt (bỏ dấu để so sánh)
function normalize(str) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function highlight(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${escapeRegex(query)})`, "gi");
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

// Tạo overlay kết quả
let overlay = qs("#searchResultsOverlay");
if (!overlay) {
  overlay = document.createElement("div");
  overlay.id = "searchResultsOverlay";
  overlay.className = "search-results-overlay";
  overlay.innerHTML = `
    <div class="search-results-inner">
      <p class="sr-label">Kết quả tìm kiếm:</p>
      <div id="resultsList"></div>
      <p class="sr-empty" id="srEmpty" hidden>Không tìm thấy kết quả phù hợp.</p>
    </div>`;
  // Chèn sau <nav>
  const nav = qs("nav");
  nav.insertAdjacentElement("afterend", overlay);
}

function runSearch() {
  const raw = searchInput.value.trim();
  const query = normalize(raw);
  const resultsList = qs("#resultsList");
  const srEmpty = qs("#srEmpty");

  resultsList.innerHTML = "";
  srEmpty.hidden = true;

  if (!query) {
    overlay.classList.remove("open");
    return;
  }

  overlay.classList.add("open");

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
      overlay.classList.remove("open");
      searchInput.value = "";
      resultsList.innerHTML = "";
      item.element.scrollIntoView({ behavior: "smooth", block: "start" });
      // Flash highlight
      item.element.style.outline = "2px solid #d32f2f";
      item.element.style.outlineOffset = "8px";
      setTimeout(() => {
        item.element.style.outline = "";
        item.element.style.outlineOffset = "";
      }, 1400);
    });
    resultsList.appendChild(div);
  });
}

searchBtn.addEventListener("click", runSearch);

searchInput.addEventListener("input", runSearch);

searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") runSearch();
  if (e.key === "Escape") {
    overlay.classList.remove("open");
    searchInput.value = "";
  }
});

// Đóng overlay khi click ra ngoài
document.addEventListener("click", (e) => {
  if (!overlay.contains(e.target) && !qs("header").contains(e.target)) {
    overlay.classList.remove("open");
  }
});

/* ============================================================
   4. SCROLL-TRIGGERED SECTION ANIMATIONS
   ============================================================ */
const sectionObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        sectionObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.08 },
);

qsa(".section-block").forEach((el, i) => {
  el.style.transitionDelay = `${i * 0.05}s`;
  sectionObserver.observe(el);
});
