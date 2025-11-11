/***** Bloggar – Guardian API integration (client-side friendly) *****/

/* === CONFIG === */
const API_KEY = "test"; // ganti dengan key kamu dari Guardian
const BASE = "https://content.guardianapis.com";

const COUNTRY = "us"; // tidak dipakai langsung oleh Guardian; tetap disimpan untuk kompatibilitas UI

// Limits
const LATEST_LIMIT   = 10;  // breaking
const POPULAR_LIMIT  = 10;  // popular
const CATEGORY_LIMIT = 20;  // category
const HERO_LIMIT     = 4;   // hero section (besar + 3 kecil)
const SPON_LIMIT     = 4;   // sponsored list

// DOM refs
const latestWrapper = document.getElementById("latest-wrapper");
const popularList   = document.getElementById("popular-list");
const categoryList  = document.getElementById("category-list");
const heroGallery   = document.getElementById("hero-gallery");
const sponsorList   = document.getElementById("sponsor-list");

// UI (re-use existing)
const navToggle       = document.querySelector(".nav-menu_toggle");
const navMenu         = document.querySelector(".nav_menu");
const navClose        = document.querySelector(".nav-menu_close");
const rightHeader     = document.querySelector(".right_header-toggle");
const headerRightMenu = document.querySelector(".header-right");
const rightClose      = document.querySelector(".header-right_close");
const backTopbtn      = document.querySelector(".back-top-btn");
const searchBtn       = document.querySelector(".search_bar");

/* ===== Helpers ===== */
const fetchJSON = async (url) => {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json();
};

const encode = encodeURIComponent;
const idFor = (section, idx, field) => `${section}-${idx}-${field}`;

const articleLink = (a) => {
  const q = new URLSearchParams({
    url: a.url || "",
    title: a.title || "",
    author: a.author || "",
    source: (a.source && a.source.name) || "",
    date: a.publishedAt || "",
    image: a.urlToImage || ""
  });
  return `article.html?${q.toString()}`;
};

const fmtDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { year:"numeric", month:"short", day:"2-digit" });
};

const safeImg = (src, alt = "image") => {
  const defaultImg = "img/no-image-available.jpg";
  const finalSrc = src && src.trim() !== "" ? src : defaultImg;
  return `<img src="${finalSrc}" alt="${alt}" onerror="this.src='${defaultImg}'">`;
};

/* ===== Guardian-specific helpers ===== */
// Build Guardian URL with common fields for images & text.
// show-fields=thumbnail,trailText,byline untuk dapat gambar & ringkasan.
const gUrl = (path, params = {}) => {
  const p = new URLSearchParams({
    "api-key": API_KEY,
    "show-fields": "thumbnail,trailText,byline",
    "page-size": 10,
    ...params,
  });
  return `${BASE}/${path}?${p.toString()}`;
};

// Strip HTML tags (Guardian trailText sering berisi HTML)
const stripHtml = (html = "") => html.replace(/<[^>]+>/g, "");

// Guardian -> NewsAPI-like object agar kompatibel dengan renderer kamu
const mapGuardian = (results = []) =>
  results.map(item => ({
    title: item.webTitle || "Untitled",
    url: item.webUrl,
    publishedAt: item.webPublicationDate,
    urlToImage: item.fields?.thumbnail || "",
    description: stripHtml(item.fields?.trailText || ""),
    author: item.fields?.byline || "",
    source: { name: item.sectionName || "The Guardian" },
  }));

/* ===== Renderers (tetap, dari kode kamu) ===== */

// HERO (Gallery)
const renderHero = (articles) => {
  if (!heroGallery) return;
  const items = (articles || []).slice(0, HERO_LIMIT);
  if (!items.length) { heroGallery.innerHTML = ""; return; }

  const [a0, a1, a2, a3] = items;

  const big = a0 ? `
    <div class="gallery_item">
      <a href="${articleLink(a0)}">
        <div class="img-holder">
          ${safeImg(a0.urlToImage, "Hero")}
          <div class="gallery_content">
            <span class="badge secondary">${(a0.source && a0.source.name) || "News"}</span>
            <h3 class="gallery_title">${a0.title || "Untitled"}</h3>
            <ul class="gallery-info">
              <li><p>${a0.author || (a0.source?.name || "Unknown")}</p></li>
              <li><p>${fmtDate(a0.publishedAt)}</p></li>
            </ul>
          </div>
        </div>
      </a>
    </div>
  ` : "";

  const rightGrid = `
    <div class="gallery_item g2">
      ${
        [a1, a2].map((a, i) => a ? `
          <a href="${articleLink(a)}">
            <div class="img-holder">
              ${safeImg(a.urlToImage, "Hero Small " + (i+1))}
              <div class="gallery_content">
                <span class="badge secondary">${a.source?.name || "News"}</span>
                <h3 class="gallery_title">${a.title || "Untitled"}</h3>
                <ul class="gallery-info">
                  <li><p>${a.author || (a.source?.name || "Unknown")}</p></li>
                  <li><p>${fmtDate(a.publishedAt)}</p></li>
                </ul>
              </div>
            </div>
          </a>
        ` : "").join("")
      }
      ${
        a3 ? `
          <a href="${articleLink(a3)}">
            <div class="img-holder">
              ${safeImg(a3.urlToImage, "Hero Small 3")}
              <div class="gallery_content">
                <span class="badge secondary">${a3.source?.name || "News"}</span>
                <h3 class="gallery_title">${a3.title || "Untitled"}</h3>
                <ul class="gallery-info">
                  <li><p>${a3.author || (a3.source?.name || "Unknown")}</p></li>
                  <li><p>${fmtDate(a3.publishedAt)}</p></li>
                </ul>
              </div>
            </div>
          </a>
        ` : ""
      }
    </div>
  `;

  heroGallery.innerHTML = big + rightGrid;
};

// Latest (Breaking) -> Swiper slides
const renderLatest = (articles) => {
  if (!latestWrapper) return;
  latestWrapper.innerHTML = articles.map((a, i) => `
    <div class="swiper-slide breaking_box" id="${idFor("latest", i, "card")}">
      <div class="img-banner" id="${idFor("latest", i, "image")}">
        ${safeImg(a.urlToImage, "Breaking")}
      </div>
      <div class="breaking_content">
        <span class="date" id="${idFor("latest", i, "date")}">${fmtDate(a.publishedAt)}</span>
        <a href="${articleLink(a)}">
          <h2 class="breaking_content-title" id="${idFor("latest", i, "title")}">${a.title || "Untitled"}</h2>
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
        640:  { slidesPerView: 1, spaceBetween: 0 },
        768:  { slidesPerView: 2, spaceBetween: 0 },
        1024: { slidesPerView: 3, spaceBetween: 0 },
      }
    });
  }
};

// Popular list (grid)
const renderPopular = (articles) => {
  if (!popularList) return;
  popularList.innerHTML = articles.map((a, i) => `
    <div class="popular_post-item" id="${idFor("popular", i, "card")}">
      <div class="popular-banner" id="${idFor("popular", i, "image")}">
        ${safeImg(a.urlToImage, "Popular")}
      </div>
      <div class="popular-content">
        <span class="date" id="${idFor("popular", i, "date")}">${fmtDate(a.publishedAt)}</span>
        <a href="${articleLink(a)}">
          <h3 class="popular-title" id="${idFor("popular", i, "title")}">${a.title || "Untitled"}</h3>
        </a>
      </div>
    </div>
  `).join("");
};

// Category list
const renderCategory = (articles) => {
  if (!categoryList) return;
  categoryList.innerHTML = articles.map((a, i) => `
    <div class="highlits_item" id="${idFor("cat", i, "card")}">
      <a href="${articleLink(a)}">
        <div class="img-holder">${safeImg(a.urlToImage, "Article")}</div>
        <div class="card_content">
          <h2 class="card_title" id="${idFor("cat", i, "title")}">${a.title || "Untitled"}</h2>
          <ul class="card-info">
            <li><img src="${a.urlToImage || 'img/user-1.jpg'}" alt="avatar" style="width:32px;height:32px;border-radius:50%;object-fit:cover;"></li>
            <li><p id="${idFor("cat", i, "author")}">${a.author || (a.source?.name || "Unknown")}</p></li>
            <li><p id="${idFor("cat", i, "date")}">${fmtDate(a.publishedAt)}</p></li>
          </ul>
          <p class="card_text" id="${idFor("cat", i, "desc")}">
            ${(a.description || "").toString().slice(0, 140)}...
          </p>
        </div>
      </a>
    </div>
  `).join("");
};

// Sponsored list
const renderSponsored = (articles) => {
  if (!sponsorList) return;
  sponsorList.innerHTML = (articles || []).slice(0, SPON_LIMIT).map((a, i) => `
    <li class="sponsor_item" id="${idFor('spon', i, 'card')}">
      <a href="${articleLink(a)}">
        <div class="img-holder">
          ${safeImg(a.urlToImage, "Sponsored")}
          <span class="badge primary">${a.source?.name || 'Sponsored'}</span>
        </div>
        <div class="card-content">
          <h2 class="card_title">${a.title || "Untitled"}</h2>
          <ul class="card-info">
            <li><img src="${a.urlToImage || 'img/user-1.jpg'}" alt="" style="width:32px;height:32px;border-radius:50%;object-fit:cover;"></li>
            <li><p>${a.author || (a.source?.name || "Unknown")}</p></li>
            <li><p>${fmtDate(a.publishedAt)}</p></li>
          </ul>
        </div>
      </a>
    </li>
  `).join("");
};

/* ===== Data loaders (Guardian) ===== */

// Guardian tidak punya "country=us" seperti NewsAPI. Kita ambil yang terbaru (newest).
const loadHero = async () => {
  const url = gUrl("search", {
    "order-by": "newest",
    "page-size": HERO_LIMIT,
    "q": "", // headline campuran
  });
  const data = await fetchJSON(url);
  renderHero(mapGuardian(data.response?.results));
};

const loadLatest = async () => {
  const url = gUrl("search", {
    "order-by": "newest",
    "page-size": LATEST_LIMIT,
    "q": "", // breaking terbaru
  });
  const data = await fetchJSON(url);
  renderLatest(mapGuardian(data.response?.results));
};

// "Popular": pakai relevance terhadap query umum
const loadPopular = async () => {
  const url = gUrl("search", {
    "order-by": "relevance",
    "page-size": POPULAR_LIMIT,
    "q": "news",
  });
  const data = await fetchJSON(url);
  renderPopular(mapGuardian(data.response?.results));
};

// Pemetaan kategori ke section Guardian
const normalizeCategory = (cat) => {
  const m = {
    lifestyle: "lifeandstyle",
    foods: "lifeandstyle",
    travel: "travel",
    business: "business",
    entertainment: "culture",     // Guardian: budaya/hiburan luas
    general: "",                  // tanpa section -> semua
    health: "society",            // tidak ada 'health' murni; society sering memuat kesehatan
    science: "science",
    sports: "sport",              // Guardian pakai 'sport' (tanpa 's')
    technology: "technology",
  };
  return m[cat?.toLowerCase()] ?? "";
};

const loadCategory = async (category = "general") => {
  const section = normalizeCategory(category);
  const params = {
    "order-by": "newest",
    "page-size": CATEGORY_LIMIT,
  };
  if (section) params.section = section;
  const url = gUrl("search", params);
  const data = await fetchJSON(url);
  renderCategory(mapGuardian(data.response?.results));
};

// "Sponsored": query tematik dengan relevansi
const loadSponsored = async () => {
  const url = gUrl("search", {
    "order-by": "relevance",
    "page-size": SPON_LIMIT,
    // query sederhana agar beda dengan kategori kiri
    "q": "technology OR business",
  });
  const data = await fetchJSON(url);
  renderSponsored(mapGuardian(data.response?.results));
};

// Search overlay (update ke Guardian)
const ensureSearchOverlay = () => {
  if (document.getElementById("search-overlay")) return;
  const el = document.createElement("div");
  el.id = "search-overlay";
  el.innerHTML = `
    <div style="
      position:fixed;inset:0;background:rgba(0,0,0,.45);
      display:flex;align-items:flex-start;justify-content:center;z-index:9999;padding-top:10vh;">
      <div style="background:#fff;width:min(760px,92vw);border-radius:12px;padding:16px;">
        <div style="display:flex;gap:8px;align-items:center;">
          <input id="search-input" type="text" placeholder="Search news..." style="flex:1;border:1px solid #e9edff;border-radius:8px;padding:12px;font-size:16px;">
          <button id="search-submit" class="form_btn" style="padding:12px 16px;border-radius:8px;background:var(--first-color-alt);color:#fff;">Search</button>
          <button id="search-close" style="padding:12px 16px;border-radius:8px;border:1px solid #e9edff;background:#fff;">Close</button>
        </div>
        <div id="search-results" class="grid" style="margin-top:16px;grid-template-columns:1fr;gap:12px;"></div>
      </div>
    </div>
  `;
  document.body.appendChild(el);

  document.getElementById("search-close").onclick = () => el.remove();
  document.getElementById("search-submit").onclick = async () => {
    const q = document.getElementById("search-input").value?.trim();
    const resWrap = document.getElementById("search-results");
    if (!q) { resWrap.innerHTML = "<p>Masukkan kata kunci…</p>"; return; }
    resWrap.innerHTML = "<p>Mencari…</p>";
    try {
      const today = new Date().toISOString().slice(0,10);
      const url = gUrl("search", {
        "order-by": "relevance",
        "page-size": 20,
        "from-date": today,
        "to-date": today,
        "q": q
      });
      const data = await fetchJSON(url);
      const articles = mapGuardian(data.response?.results);
      resWrap.innerHTML = articles.map((a, i) => `
        <a class="post-card" href="${articleLink(a)}" id="${idFor("search", i, "card")}" style="display:grid;grid-template-columns:120px 1fr;gap:12px;align-items:center;border:1px solid #eef0fc;border-radius:10px;padding:10px;">
          <div class="thumb img-holder" style="--width:4;--height:3;">
            ${safeImg(a.urlToImage, "thumb")}
          </div>
          <div class="info">
            <span class="date" id="${idFor("search", i, "date")}">${fmtDate(a.publishedAt)}</span>
            <h4 class="title" id="${idFor("search", i, "title")}">${a.title || "Untitled"}</h4>
          </div>
        </a>
      `).join("") || "<p>Tidak ada hasil.</p>";
    } catch (e) {
      resWrap.innerHTML = `<p>Error: ${e.message}</p>`;
    }
  };
};

/* ===== Wire up existing UI ===== */
if (navToggle) navToggle.addEventListener("click", () => navMenu.classList.add("show-menu"));
if (navClose)  navClose.addEventListener("click", () => navMenu.classList.remove("show-menu"));
if (rightHeader) rightHeader.addEventListener("click", () => headerRightMenu.classList.add("show-right_menu"));
if (rightClose)   rightClose.addEventListener("click", () => headerRightMenu.classList.remove("show-right_menu"));

const showBackTop = () => (window.scrollY > 150) ? backTopbtn.classList.add("active") : backTopbtn.classList.remove("active");
window.addEventListener("scroll", showBackTop);

if (searchBtn) {
  searchBtn.addEventListener("click", ensureSearchOverlay);
}

// Kategori dari menu
document.querySelectorAll(".nav_list .nav_link[data-cat]")?.forEach(a => {
  a.addEventListener("click", async (e) => {
    e.preventDefault();
    const cat = a.getAttribute("data-cat");
    document.querySelectorAll(".nav_list .nav_link").forEach(n => n.classList.remove("active"));
    a.classList.add("active");
    try {
      await loadCategory(cat);
      window.scrollTo({ top: document.querySelector(".highlight").offsetTop - 60, behavior: "smooth" });
    } catch (err) {
      console.error(err);
      if (categoryList) categoryList.innerHTML = `<p style="padding:12px;">Gagal memuat kategori (${cat}).</p>`;
    }
  });
});

/* ===== Initial load ===== */
(async () => {
  try {
    await Promise.all([
      loadHero(),               // HERO
      loadLatest(),             // Breaking 10
      loadPopular(),            // Popular 10
      loadCategory("general"),  // default kategori 20
      loadSponsored(),          // Sponsored 4
    ]);
  } catch (err) {
    console.error(err);
  }
})();
