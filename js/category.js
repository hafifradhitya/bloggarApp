/***** Bloggar – Category page loader *****/
"use strict";

// === CONFIG (samakan dengan script.js) ===
const API_KEY  = "44bdc7b07e754cf2a92845309afc2f51";
const BASE     = "https://newsapi.org/v2";
const COUNTRY  = "us";

// DOM refs
const categoryGrid   = document.getElementById("category-grid");
const categoryTitle  = document.getElementById("category-title");
const breadcrumbCat  = document.getElementById("breadcrumb-cat");
const tickerText     = document.getElementById("ticker-text");
const sidebarLatest  = document.getElementById("sidebar-latest");

// UI refs
const navToggle   = document.querySelector(".nav-menu_toggle");
const navMenu     = document.querySelector(".nav_menu");
const navClose    = document.querySelector(".nav-menu_close");
const rightHeader = document.querySelector(".right_header-toggle");
const headerRight = document.querySelector(".header-right");
const rightClose  = document.querySelector(".header-right_close");
const backTopbtn  = document.querySelector(".back-top-btn");
const searchBtn   = document.querySelector(".search_bar");

// Helpers
const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

const encode = encodeURIComponent;
const idFor  = (section, idx, field) => `${section}-${idx}-${field}`;

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit"
  });
};

const safeImg = (src, alt = "image") => {
  const fallback = "img/no-image-available.jpg";
  const finalSrc = src && src.trim() ? src : fallback;
  return `<img src="${finalSrc}" alt="${alt}" class="img-cover" onerror="this.src='${fallback}'">`;
};

const truncate = (text, max = 40) => {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
};

const articleLink = (a) => {
  const q = new URLSearchParams({
    url:    a.url            || "",
    title:  a.title          || "",
    author: a.author         || "",
    source: a.source?.name   || "",
    date:   a.publishedAt    || "",
    image:  a.urlToImage     || ""
  });
  return `article.html?${q.toString()}`;
};

const labelForCat = (cat) => {
  if (!cat) return "General";
  const c = cat.toLowerCase();
  return c.charAt(0).toUpperCase() + c.slice(1);
};

// ===== Renderers =====

// List artikel di halaman kategori (pakai style left_highlights / highlits_item)
const renderCategoryPage = (articles = []) => {
  if (!categoryGrid) return;

  if (!articles.length) {
    categoryGrid.innerHTML = `<p style="padding:16px;">No articles found for this category.</p>`;
    return;
  }

  categoryGrid.innerHTML = articles.map((a, i) => `
    <div class="highlits_item" id="${idFor("catpage", i, "card")}">
      <a href="${articleLink(a)}">
        <div class="img-holder">
          ${safeImg(a.urlToImage, "Article")}
        </div>
        <div class="card_content">
          <h2 class="card_title" id="${idFor("catpage", i, "title")}">
            ${truncate(a.title || "Untitled", 80)}
          </h2>
          <ul class="card-info">
            <li>
              <img src="${a.urlToImage || 'img/user-1.jpg'}"
                   alt="avatar"
                   style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
            </li>
            <li>
              <p id="${idFor("catpage", i, "author")}">
                ${a.author || a.source?.name || "Unknown"}
              </p>
            </li>
            <li>
              <p id="${idFor("catpage", i, "date")}">
                ${fmtDate(a.publishedAt)}
              </p>
            </li>
          </ul>
          <p class="card_text" id="${idFor("catpage", i, "desc")}">
            ${(a.description || "").toString().slice(0, 160)}...
          </p>
        </div>
      </a>
    </div>
  `).join("");
};

// Sidebar "our latest news"
const renderSidebarLatest = (articles = []) => {
  if (!sidebarLatest) return;
  const items = articles.slice(0, 3);

  sidebarLatest.innerHTML = items.map((a, i) => `
    <div class="post_box" id="${idFor("side", i, "card")}">
      <div class="img-banner" id="${idFor("side", i, "image")}">
        ${safeImg(a.urlToImage, "Sidebar latest")}
      </div>
      <div class="post_content">
        <span class="date" id="${idFor("side", i, "date")}">
          ${fmtDate(a.publishedAt)}
        </span>
        <a href="${articleLink(a)}"
           class="post_title"
           id="${idFor("side", i, "title")}">
          ${truncate(a.title || "Untitled", 55)}
        </a>
      </div>
    </div>
  `).join("");
};

// ===== Data loaders =====
const loadCategory = async (catParam) => {
  const cat = (catParam || "general").toLowerCase();
  const url = `${BASE}/top-headlines?country=${COUNTRY}&category=${encode(cat)}&pageSize=20&apiKey=${API_KEY}`;
  const data = await fetchJSON(url);
  const articles = data.articles || [];

  renderCategoryPage(articles);

  // set ticker text & title
  const label = labelForCat(cat);
  if (categoryTitle)  categoryTitle.textContent = label + " News";
  if (breadcrumbCat)  breadcrumbCat.textContent = label;
  if (tickerText && articles[0]?.title) {
    tickerText.textContent = truncate(articles[0].title, 60);
  }
};

const loadLatestForSidebar = async () => {
  const url = `${BASE}/top-headlines?country=${COUNTRY}&pageSize=10&apiKey=${API_KEY}`;
  const data = await fetchJSON(url);
  renderSidebarLatest(data.articles || []);
};

// ===== UI wiring (nav, sidebar panel, back to top, search info) =====
const initUI = () => {
  if (navToggle) navToggle.addEventListener("click", () => {
    navMenu?.classList.add("show-menu");
  });
  if (navClose) navClose.addEventListener("click", () => {
    navMenu?.classList.remove("show-menu");
  });

  if (rightHeader) rightHeader.addEventListener("click", () => {
    headerRight?.classList.add("show-right_menu");
  });
  if (rightClose) rightClose.addEventListener("click", () => {
    headerRight?.classList.remove("show-right_menu");
  });

  const onScroll = () => {
    if (!backTopbtn) return;
    if (window.scrollY > 150) backTopbtn.classList.add("active");
    else backTopbtn.classList.remove("active");
  };
  window.addEventListener("scroll", onScroll);

  if (searchBtn) {
    // bisa kamu sambungkan ke overlay search di homepage kalau mau,
    // sementara kasih info saja:
    searchBtn.addEventListener("click", () => {
      alert("Search is available on the homepage.");
    });
  }

  // highlight nav_link aktif sesuai kategori
  const params = new URLSearchParams(location.search);
  const cat = (params.get("cat") || "general").toLowerCase();
  document
    .querySelectorAll(".nav_list .nav_link")
    .forEach((link) => {
      const href = link.getAttribute("href") || "";
      if (href.includes(`cat=${cat}`)) {
        link.classList.add("active");
      } else if (cat === "general" && href === "index.html") {
        // optional: kalau cat general, biarkan home tidak aktif
      }
    });
};

// ===== Init =====
window.addEventListener("DOMContentLoaded", async () => {
  initUI();

  const params = new URLSearchParams(location.search);
  const cat = params.get("cat") || "general";

  try {
    await Promise.all([
      loadCategory(cat),
      loadLatestForSidebar()
    ]);
  } catch (err) {
    console.error(err);
    if (categoryGrid) {
      categoryGrid.innerHTML = `<p style="padding:16px;">Failed to load category articles: ${err.message}</p>`;
    }
  }
});
