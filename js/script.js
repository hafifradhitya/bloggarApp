/***** Bloggar – NewsAPI integration & UI *****/
"use strict";

// === CONFIG ===
const API_KEY  = "44bdc7b07e754cf2a92845309afc2f51"; // ganti kalau perlu
const BASE     = "https://newsapi.org/v2";
const COUNTRY  = "us";

// Limits
const LATEST_LIMIT   = 10;  // breaking
const POPULAR_LIMIT  = 10;  // popular
const CATEGORY_LIMIT = 20;  // category
const HERO_LIMIT     = 4;   // hero section (1 big + 3 small)
const SPON_LIMIT     = 4;   // sponsored

// DOM refs
const latestWrapper = document.getElementById("latest-wrapper");
const popularList   = document.getElementById("popular-list");
const categoryList  = document.getElementById("category-list");
const heroGallery   = document.getElementById("hero-gallery");
const sponsorList   = document.getElementById("sponsor-list");
const tickerText    = document.getElementById("ticker-text");

// UI
const navToggle       = document.querySelector(".nav-menu_toggle");
const navMenu         = document.querySelector(".nav_menu");
const navClose        = document.querySelector(".nav-menu_close");
const rightHeader     = document.querySelector(".right_header-toggle");
const headerRightMenu = document.querySelector(".header-right");
const rightClose      = document.querySelector(".header-right_close");
const backTopbtn      = document.querySelector(".back-top-btn");
const searchBtn       = document.querySelector(".search_bar");

// ===== Helpers =====
const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

const encode = encodeURIComponent;

const idFor = (section, idx, field) => `${section}-${idx}-${field}`;

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

/* ==== text truncate helper ==== */
const truncate = (text, max = 40) => {
  if (!text) return "";
  return text.length > max ? text.slice(0, max) + "..." : text;
};

/* ==== Helpers for hero static ==== */
const setTextById = (id, text) => {
  const el = document.getElementById(id);
  if (el && text) el.textContent = text;
};

const setImgById = (id, src) => {
  const el = document.getElementById(id);
  if (!el) return;
  const fallback = "img/no-image-available.jpg";
  el.src = src && src.trim() ? src : fallback;
  el.classList.add("img-cover");
};

const setHrefById = (id, href) => {
  const el = document.getElementById(id);
  if (el && href) el.href = href;
};

const bindHeroCard = (prefix, article, withDesc = false) => {
  if (!article) return;

  setHrefById(`${prefix}-link`, articleLink(article));
  setImgById(`${prefix}-img`, article.urlToImage || "");
  setTextById(`${prefix}-badge`, article.source?.name || "News");

  // 🔥 title dipotong
  setTextById(`${prefix}-title`, truncate(article.title, 30));

  if (withDesc) {
    const desc = (article.description || "").toString().slice(0, 120) + "...";
    setTextById(`${prefix}-desc`, desc);
  }

  setTextById(
    `${prefix}-author`,
    article.author || article.source?.name || "Unknown"
  );
  setTextById(`${prefix}-date`, fmtDate(article.publishedAt));
};

// ===== Renderers =====

// HERO Static
const renderHero = (articles = []) => {
  const items = articles.slice(0, HERO_LIMIT);
  if (!items.length) return;

  const [a0, a1, a2, a3] = items;

  bindHeroCard("hero0", a0, true);
  bindHeroCard("hero1", a1, false);
  bindHeroCard("hero2", a2, false);
  bindHeroCard("hero3", a3, false);

  if (tickerText && a0?.title) {
    tickerText.textContent = truncate(a0.title, 40);
  }
};

// 🔥 Breaking News (updated truncate)
const renderLatest = (articles = []) => {
  if (!latestWrapper) return;
  latestWrapper.innerHTML = articles.map((a, i) => `
    <div class="swiper-slide breaking_box" id="${idFor("latest", i, "card")}">
      <div class="img-banner" id="${idFor("latest", i, "image")}">
        ${safeImg(a.urlToImage, "Breaking")}
      </div>
      <div class="breaking_content">
        <span class="date" id="${idFor("latest", i, "date")}">
          ${fmtDate(a.publishedAt)}
        </span>
        <a href="${articleLink(a)}">
          <h2 class="breaking_content-title" id="${idFor("latest", i, "title")}">
            ${truncate(a.title || "Untitled", 40)}
          </h2>
        </a>
      </div>
    </div>
  `).join("");

  if (window.breakingSwiper) {
    window.breakingSwiper.update();
  } else {
    window.breakingSwiper = new Swiper(".breaking_container", {
      centeredSlides: true,
      autoplay: { delay: 4500, disableOnInteraction: false },
      loop: true,
      slidesPerView: 1,
      mousewheel: { forceToAxis: true, releaseOnEdges: true },
      breakpoints: {
        640:  { slidesPerView: 1 },
        768:  { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
      }
    });
  }
};

// Popular
const renderPopular = (articles = []) => {
  if (!popularList) return;
  popularList.innerHTML = articles.map((a, i) => `
    <div class="popular_post-item" id="${idFor("popular", i, "card")}">
      <div class="popular-banner" id="${idFor("popular", i, "image")}">
        ${safeImg(a.urlToImage, "Popular")}
      </div>
      <div class="popular-content">
        <span class="date" id="${idFor("popular", i, "date")}">
          ${fmtDate(a.publishedAt)}
        </span>
        <a href="${articleLink(a)}">
          <h3 class="popular-title" id="${idFor("popular", i, "title")}">
            ${truncate(a.title || "Untitled", 35)}
          </h3>
        </a>
      </div>
    </div>
  `).join("");
};

// Category
const renderCategory = (articles = []) => {
  if (!categoryList) return;
  categoryList.innerHTML = articles.map((a, i) => `
    <div class="highlits_item" id="${idFor("cat", i, "card")}">
      <a href="${articleLink(a)}">
        <div class="img-holder">
          ${safeImg(a.urlToImage, "Article")}
        </div>
        <div class="card_content">
          <h2 class="card_title" id="${idFor("cat", i, "title")}">
            ${truncate(a.title || "Untitled", 45)}
          </h2>
          <ul class="card-info">
            <li>
              <img src="${a.urlToImage || 'img/user-1.jpg'}"
                   alt="avatar"
                   style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
            </li>
            <li><p id="${idFor("cat", i, "author")}">
              ${a.author || a.source?.name || "Unknown"}
            </p></li>
            <li><p id="${idFor("cat", i, "date")}">
              ${fmtDate(a.publishedAt)}
            </p></li>
          </ul>
          <p class="card_text" id="${idFor("cat", i, "desc")}">
            ${(a.description || "").toString().slice(0, 140)}...
          </p>
        </div>
      </a>
    </div>
  `).join("");
};

// Sponsored
const renderSponsored = (articles = []) => {
  if (!sponsorList) return;
  sponsorList.innerHTML = articles.slice(0, SPON_LIMIT).map((a, i) => `
    <li class="sponsor_item" id="${idFor("spon", i, "card")}">
      <a href="${articleLink(a)}">
        <div class="img-holder">
          ${safeImg(a.urlToImage, "Sponsored")}
          <span class="badge primary">${a.source?.name || "Sponsored"}</span>
        </div>
        <div class="card-content">
          <h2 class="card_title">${truncate(a.title || "Untitled", 40)}</h2>
          <ul class="card-info">
            <li>
              <img src="${a.urlToImage || 'img/user-1.jpg'}"
                   alt=""
                   style="width:32px;height:32px;border-radius:50%;object-fit:cover;">
            </li>
            <li><p>${a.author || a.source?.name || "Unknown"}</p></li>
            <li><p>${fmtDate(a.publishedAt)}</p></li>
          </ul>
        </div>
      </a>
    </li>
  `).join("");
};

// ===== Data loaders =====
const normalizeCategory = (cat) => {
  const map = {
    lifestyle: "general",
    foods:     "general",
    travel:    "general",
    business:  "business",
    entertainment: "entertainment",
    general:       "general",
    health:        "health",
    science:       "science",
    sports:        "sports",
    technology:    "technology"
  };
  return map[cat?.toLowerCase()] || "general";
};

const loadHero = async () => {
  const url = `${BASE}/top-headlines?country=${COUNTRY}&pageSize=${HERO_LIMIT}&apiKey=${API_KEY}`;
  const data = await fetchJSON(url);
  renderHero(data.articles || []);
};

const loadLatest = async () => {
  const url = `${BASE}/top-headlines?country=${COUNTRY}&pageSize=${LATEST_LIMIT}&apiKey=${API_KEY}`;
  const data = await fetchJSON(url);
  renderLatest(data.articles || []);
};

const loadPopular = async () => {
  const q   = "news";
  const url = `${BASE}/everything?q=${encode(q)}&language=en&sortBy=popularity&pageSize=${POPULAR_LIMIT}&apiKey=${API_KEY}`;
  const data = await fetchJSON(url);
  renderPopular(data.articles || []);
};

const loadCategory = async (category = "general") => {
  const cat = normalizeCategory(category);
  const url = `${BASE}/top-headlines?country=${COUNTRY}&category=${cat}&pageSize=${CATEGORY_LIMIT}&apiKey=${API_KEY}`;
  const data = await fetchJSON(url);
  renderCategory(data.articles || []);
};

const loadSponsored = async () => {
  const q   = "(technology OR business) AND -sports";
  const url = `${BASE}/everything?q=${encode(q)}&language=en&sortBy=relevancy&pageSize=${SPON_LIMIT}&apiKey=${API_KEY}`;
  const data = await fetchJSON(url);
  renderSponsored(data.articles || []);
};

// Search overlay
const ensureSearchOverlay = () => {
  if (document.getElementById("search-overlay")) return;

  const el = document.createElement("div");
  el.id = "search-overlay";
  el.innerHTML = `
    <div style="
      position:fixed;inset:0;background:rgba(0,0,0,.45);
      display:flex;align-items:flex-start;justify-content:center;
      z-index:9999;padding-top:10vh;">
      <div style="
        background:#fff;width:min(760px,92vw);
        border-radius:12px;padding:16px;">
        <div style="display:flex;gap:8px;align-items:center;">
          <input id="search-input" type="text" placeholder="Search news..."
                 style="flex:1;border:1px solid #e9edff;border-radius:8px;padding:12px;font-size:16px;">
          <button id="search-submit" class="form_btn"
                  style="padding:12px 16px;border-radius:8px;background:var(--first-color-alt);color:#fff;">
            Search
          </button>
          <button id="search-close"
                  style="padding:12px 16px;border-radius:8px;border:1px solid #e9edff;background:#fff;">
            Close
          </button>
        </div>
        <div id="search-results" class="grid"
             style="margin-top:16px;grid-template-columns:1fr;gap:12px;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  document.getElementById("search-close").onclick = () => el.remove();
  document.getElementById("search-submit").onclick = async () => {
    const q = document.getElementById("search-input").value?.trim();
    const resWrap = document.getElementById("search-results");
    if (!q) {
      resWrap.innerHTML = "<p>Masukkan kata kunci…</p>";
      return;
    }
    resWrap.innerHTML = "<p>Mencari…</p>";
    try {
      const today = new Date().toISOString().slice(0, 10);
      const url   = `${BASE}/everything?q=${encode(q)}&from=${today}&to=${today}` +
                    `&sortBy=popularity&language=en&pageSize=20&apiKey=${API_KEY}`;
      const data  = await fetchJSON(url);
      const articles = data.articles || [];
      resWrap.innerHTML = articles.map((a, i) => `
        <a class="post-card" href="${articleLink(a)}"
           id="${idFor("search", i, "card")}"
           style="display:grid;grid-template-columns:120px 1fr;gap:12px;
                  align-items:center;border:1px solid #eef0fc;border-radius:10px;padding:10px;">
          <div class="thumb img-holder" style="--width:4;--height:3;">
            ${safeImg(a.urlToImage, "thumb")}
          </div>
          <div class="info">
            <span class="date" id="${idFor("search", i, "date")}">
              ${fmtDate(a.publishedAt)}
            </span>
            <h4 class="title" id="${idFor("search", i, "title")}">
              ${truncate(a.title || "Untitled", 50)}
            </h4>
          </div>
        </a>
      `).join("") || "<p>Tidak ada hasil.</p>";
    } catch (e) {
      resWrap.innerHTML = `<p>Error: ${e.message}</p>`;
    }
  };
};

// ===== UI wiring =====
const initUI = () => {
  if (navToggle) navToggle.addEventListener("click", () => {
    navMenu?.classList.add("show-menu");
  });
  if (navClose) navClose.addEventListener("click", () => {
    navMenu?.classList.remove("show-menu");
  });

  if (rightHeader) rightHeader.addEventListener("click", () => {
    headerRightMenu?.classList.add("show-right_menu");
  });
  if (rightClose) rightClose.addEventListener("click", () => {
    headerRightMenu?.classList.remove("show-right_menu");
  });

  const onScroll = () => {
    if (!backTopbtn) return;
    if (window.scrollY > 150) backTopbtn.classList.add("active");
    else backTopbtn.classList.remove("active");
  };
  window.addEventListener("scroll", onScroll);

  if (searchBtn) {
    searchBtn.addEventListener("click", ensureSearchOverlay);
  }

  document.querySelectorAll(".nav_list .nav_link[data-cat]").forEach((a) => {
    a.addEventListener("click", async (e) => {
      e.preventDefault();
      const cat = a.getAttribute("data-cat");
      document.querySelectorAll(".nav_list .nav_link").forEach((n) =>
        n.classList.remove("active")
      );
      a.classList.add("active");
      try {
        await loadCategory(cat);
        const target = document.querySelector(".highlight");
        if (target) {
          window.scrollTo({
            top: target.offsetTop - 60,
            behavior: "smooth"
          });
        }
      } catch (err) {
        console.error(err);
        if (categoryList) {
          categoryList.innerHTML =
            `<p style="padding:12px;">Gagal memuat kategori (${cat}).</p>`;
        }
      }
    });
  });
};

// ===== Init =====
window.addEventListener("DOMContentLoaded", async () => {
  initUI();
  try {
    await Promise.all([
      loadHero(),
      loadLatest(),
      loadPopular(),
      loadCategory("general"),
      loadSponsored()
    ]);
  } catch (err) {
    console.error(err);
  }
});
