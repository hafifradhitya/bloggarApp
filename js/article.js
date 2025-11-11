/***** Article detail loader *****/

// Nav & offcanvas (re-use)
const navToggle = document.querySelector(".nav-menu_toggle");
const navMenu = document.querySelector(".nav_menu");
const navClose = document.querySelector(".nav-menu_close");
if (navToggle) navToggle.addEventListener("click", () => navMenu.classList.add("show-menu"));
if (navClose)  navClose.addEventListener("click", () => navMenu.classList.remove("show-menu"));

const rightHeader = document.querySelector(".right_header-toggle");
const headerRightMenu = document.querySelector(".header-right");
const rightClose = document.querySelector(".header-right_close");
if (rightHeader) rightHeader.addEventListener("click", () => headerRightMenu.classList.add("show-right_menu"));
if (rightClose)  rightClose.addEventListener("click", () => headerRightMenu.classList.remove("show-right_menu"));

const backTopbtn = document.querySelector(".back-top-btn");
const showBackTop = () => (window.scrollY > 150) ? backTopbtn.classList.add("active") : backTopbtn.classList.remove("active");
window.addEventListener("scroll", showBackTop);

// Read params
const params = new URLSearchParams(location.search);
const url   = params.get("url")   || "";
const title = params.get("title") || "";
const author= params.get("author")|| "";
const source= params.get("source")|| "";
const date  = params.get("date")  || "";
const image = params.get("image") || "";

// Fill DOM
const setText = (sel, text) => { const el = document.querySelector(sel); if (el && text) el.textContent = text; };

setText(".article-title", title);
if (author) setText(".meta-author", author);
if (date)   setText(".meta-date", new Date(date).toLocaleDateString("en-US",{year:"numeric",month:"short",day:"2-digit"}));

const badge = document.querySelector(".badge.primary");
if (badge && source) badge.textContent = source;

// Featured image
const fig = document.querySelector(".article-figure img.img-cover");
if (fig && image) fig.src = image;

// Iframe mount (konten lain sudah dihapus dari HTML)
const container = document.querySelector(".content");
if (container && url) {
  const wrap = document.createElement("div");
  wrap.style.margin = "16px 0";
  wrap.innerHTML = `
    <div style="border:1px solid #e9edff;border-radius:12px;overflow:hidden;background:#fff;">
      <div style="display:flex;justify-content:space-between;align-items:center;padding:8px 12px;border-bottom:1px solid #eef0fc;">
        <strong style="color:#232f4b;">Full article</strong>
        <a href="${url}" target="_blank" rel="noopener" style="color:var(--first-color);">Open in new tab</a>
      </div>
      <iframe id="article-frame" src="${url}" style="width:100%;height:70vh;border:0;" referrerpolicy="no-referrer"></iframe>
      <div id="frame-fallback" style="display:none;padding:12px;">
        <p>Looks like this site blocks embedding. <a href="${url}" target="_blank" rel="noopener" style="color:var(--first-color);text-decoration:underline;">Open the article here</a>.</p>
      </div>
    </div>
  `;
  container.prepend(wrap);

  // Detect frame block (best-effort)
  const frame = wrap.querySelector("#article-frame");
  let loaded = false;
  frame.addEventListener("load", () => { loaded = true; });
  setTimeout(() => {
    if (!loaded) {
      wrap.querySelector("#frame-fallback").style.display = "block";
      frame.style.display = "none";
    }
  }, 2500);
}
