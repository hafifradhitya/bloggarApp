/***** Article detail loader *****/
"use strict";

// Re-use basic UI (nav, right-panel, back-to-top)
const navToggle  = document.querySelector(".nav-menu_toggle");
const navMenu    = document.querySelector(".nav_menu");
const navClose   = document.querySelector(".nav-menu_close");
const rightHeader= document.querySelector(".right_header-toggle");
const headerRight= document.querySelector(".header-right");
const rightClose = document.querySelector(".header-right_close");
const backTopbtn = document.querySelector(".back-top-btn");
const searchBtn  = document.querySelector(".search_bar");

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

  // Optional: reuse search overlay dari homepage kalau mau
  if (searchBtn) {
    searchBtn.addEventListener("click", () => {
      alert("Search is available on the homepage.");
    });
  }
};

// ===== Article from query params =====
const params = new URLSearchParams(location.search);
const url    = params.get("url")    || "";
const title  = params.get("title")  || "";
const author = params.get("author") || "";
const source = params.get("source") || "";
const date   = params.get("date")   || "";
const image  = params.get("image")  || "";

const setText = (sel, text) => {
  const el = document.querySelector(sel);
  if (el && text) el.textContent = text;
};

const initArticle = () => {
  // Title
  setText(".article-title", title || "Untitled article");

  // Author
  if (author) {
    setText(".meta-author", author);
  }

  // Date
  if (date) {
    const d = new Date(date);
    const formatted = d.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit"
    });
    setText(".meta-date", formatted);
  }

  // Source badge
  const badge = document.querySelector(".badge.primary");
  if (badge && source) {
    badge.textContent = source;
  }

  // Main image
  const img = document.getElementById("article-main-image");
  if (img) {
    if (image) {
      img.src = image;
    }
    img.onerror = () => {
      img.src = "img/no-image-available.jpg";
    };
  }

  // Caption
  const caption = document.getElementById("article-caption");
  if (caption && source) {
    caption.textContent = `Source: ${source}`;
  }

  // Content card
  const content = document.getElementById("article-content");
  if (content) {
    content.innerHTML = `
      <div class="article-summary-card">
        <p class="article-summary-lead">
          You are reading an article provided by <strong>${source || "News provider"}</strong>.
        </p>
        <p class="article-summary-info">
          For the full content, please open the original article on the publisher's website.
        </p>
        ${
          url
            ? `
          <a href="${url}" target="_blank" rel="noopener"
             class="article-readmore-btn">
            Read full article
            <i class='bx bx-link-external'></i>
          </a>
          `
            : `<p class="article-summary-warning">Original URL is not available.</p>`
        }
      </div>
    `;
  }
};

// ===== Init =====
window.addEventListener("DOMContentLoaded", () => {
  initUI();
  initArticle();
});
