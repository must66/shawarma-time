import { categoryOrder, loadSiteData, localized, ui } from "./data.js";
import { fetchPublicSiteData, subscribeToPublicUpdates } from "./publicApi.js";

let lang = localStorage.getItem("shawarma-time-lang") || "nl";
let activeCategory = "all";
let data = loadSiteData();
let unsubscribeRealtime = null;

const $ = (selector) => document.querySelector(selector);

function t(path) {
  return path.split(".").reduce((value, key) => value?.[key], ui[lang]) || path;
}

function applyLanguage() {
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    el.setAttribute("aria-label", t(el.dataset.i18nAria));
  });
  document.querySelectorAll("[data-lang]").forEach((button) => {
    button.classList.toggle("active", button.dataset.lang === lang);
  });
  document.querySelectorAll("[data-section-text]").forEach((el) => {
    el.textContent = localized(data.sectionText?.[el.dataset.sectionText], lang);
  });
}

function phoneHref(phone) {
  return `tel:${phone.replace(/\s+/g, "")}`;
}

function whatsappHref(phone) {
  const normalized = phone.replace(/\D/g, "").replace(/^0/, "31");
  return `https://wa.me/${normalized}?text=${encodeURIComponent(data.settings.whatsappMessage)}`;
}

function renderHero() {
  $("#heroBg").style.backgroundImage = `url("${data.homepage.heroImage}")`;
  $("#heroEyebrow").textContent = localized(data.homepage.eyebrow, lang);
  $("#heroTitle").textContent = localized(data.homepage.title, lang);
  $("#heroSlogan").textContent = localized(data.homepage.slogan, lang);
  $("#heroIntro").textContent = localized(data.homepage.intro, lang);
  $("#aboutText").textContent = localized(data.homepage.about, lang);
  $("#heroWhatsapp").href = whatsappHref(data.settings.phone);
  $("#heroWhatsapp").textContent = t("section.whatsapp");
}

function renderDesign() {
  const design = data.design || {};
  const root = document.documentElement;
  root.style.setProperty("--orange", design.accentColor || "#ff7a1a");
  root.style.setProperty("--gold", design.goldColor || "#ffbf58");
  root.style.setProperty("--button", design.buttonColor || design.accentColor || "#ff7a1a");
  root.style.setProperty("--radius", `${Number(design.borderRadius || 8)}px`);
  root.style.setProperty("--hero-overlay", `${Number(design.heroOverlay || 78) / 100}`);
  root.style.setProperty("--site-font", fontStack(design.font));
  document.body.dataset.tone = design.tone || "dark";
  document.body.dataset.cardStyle = design.cardStyle || "glass";
  document.body.classList.toggle("no-glow", design.glow === false);
  document.body.classList.toggle("no-animations", design.animations === false);
  setOptionalBackground("#menu", design.menuBackground);
  setOptionalBackground("#offers", design.offersBackground);
  setOptionalBackground("#gallery", design.galleryBackground);
  setOptionalBackground("#about", design.aboutBackground);
  setOptionalBackground("#contact", design.contactBackground);
  document.querySelectorAll(".brand-mark").forEach((mark) => {
    if (design.logoImage) {
      mark.style.backgroundImage = `url("${design.logoImage}")`;
      mark.style.backgroundSize = "cover";
      mark.style.color = "transparent";
    } else {
      mark.style.backgroundImage = "";
      mark.style.color = "";
    }
  });
}

function fontStack(font) {
  const stacks = {
    Inter: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    Elegant: 'Georgia, "Times New Roman", serif',
    Modern: '"Trebuchet MS", Inter, system-ui, sans-serif',
    Bold: 'Impact, Inter, system-ui, sans-serif'
  };
  return stacks[font] || stacks.Inter;
}

function setOptionalBackground(selector, image) {
  const el = $(selector);
  if (!el) return;
  el.style.backgroundImage = image ? `linear-gradient(rgba(9,5,4,.86), rgba(9,5,4,.9)), url("${image}")` : "";
  el.style.backgroundSize = image ? "cover" : "";
  el.style.backgroundPosition = image ? "center" : "";
}

function renderBanners() {
  $("#banners").innerHTML = data.banners.map((banner) => `
    <article class="ad-banner" style="--banner-image:url('${banner.image}')">
      <div>
        <span class="ad-kicker">Shawarma Time</span>
        <strong>${localized(banner.title, lang)}</strong>
        <span>${localized(banner.text, lang)}</span>
      </div>
    </article>
  `).join("");
}

function renderCategories() {
  const categories = ["all", ...(data.categoryOrder || categoryOrder)];
  $("#categoryTabs").innerHTML = categories.map((category) => `
    <button type="button" class="${activeCategory === category ? "active" : ""}" data-category="${category}">
      ${t(`categories.${category}`)}
    </button>
  `).join("");
  $("#categoryTabs").querySelectorAll("button").forEach((button) => {
    button.addEventListener("click", () => {
      activeCategory = button.dataset.category;
      renderMenu();
      renderCategories();
    });
  });
}

function renderBadge(badge) {
  if (!badge) return "";
  return `<mark class="badge ${badge}">${t(`badges.${badge}`)}</mark>`;
}

function itemCard(item) {
  return `
    <article class="food-card">
      <div class="food-image">
        <img src="${item.image}" alt="${localized(item.name, lang)}" loading="lazy" decoding="async" />
        ${renderBadge(item.badge)}
      </div>
      <div>
        <span>${t(`categories.${item.category}`)}</span>
        <h3>${localized(item.name, lang)}</h3>
        <p>${localized(item.desc, lang)}</p>
        <strong>${item.price}</strong>
      </div>
    </article>
  `;
}

function renderMenu() {
  const items = activeCategory === "all" ? data.menu : data.menu.filter((item) => item.category === activeCategory);
  $("#menuGrid").innerHTML = items.map(itemCard).join("");
}

function renderOffers() {
  $("#offerGrid").innerHTML = data.offers.map((offer) => `
    <article class="offer-card">
      <img src="${offer.image}" alt="${localized(offer.name, lang)}" loading="lazy" decoding="async" />
      <div>
        <span>${offer.type}</span>
        <h3>${localized(offer.name, lang)}</h3>
        <p>${localized(offer.desc, lang)}</p>
        <strong>${offer.price}</strong>
      </div>
    </article>
  `).join("");
}

function renderGallery() {
  $("#galleryGrid").innerHTML = data.gallery.map((photo) => `
    <figure>
      <button type="button" class="gallery-button" data-image="${encodeAttr(photo.image)}" data-caption="${encodeAttr(localized(photo.title, lang))}" aria-label="${t("section.fullscreen")}">
        <img src="${photo.image}" alt="${localized(photo.title, lang)}" loading="lazy" decoding="async" />
      </button>
      <figcaption>${localized(photo.title, lang)}</figcaption>
    </figure>
  `).join("");

  $("#galleryGrid").querySelectorAll(".gallery-button").forEach((button) => {
    button.addEventListener("click", () => openLightbox(button.dataset.image, button.dataset.caption));
  });
}

function openLightbox(src, caption) {
  $("#lightboxImage").src = src;
  $("#lightboxImage").alt = caption;
  $("#lightboxCaption").textContent = caption;
  $("#lightbox").showModal();
}

function renderHours() {
  $("#hoursList").innerHTML = ui[lang].days.map((day, index) => `
    <p><span>${day}</span><strong>${data.settings.hours[index] || ""}</strong></p>
  `).join("");
}

function renderReviews() {
  $("#reviewGrid").innerHTML = data.reviews.map((review) => `
    <article class="review-card">
      <div class="stars">★★★★★ <span>${review.rating}</span></div>
      <p>${localized(review.text, lang)}</p>
      <strong>${review.name}</strong>
    </article>
  `).join("");
}

function renderSocials() {
  const socials = [
    ["Instagram", data.settings.instagram],
    ["TikTok", data.settings.tiktok],
    ["Facebook", data.settings.facebook]
  ];
  $("#socialGrid").innerHTML = socials.map(([name, url]) => `
    <a href="${url}" target="_blank" rel="noopener" class="social-card">
      <span>${name.slice(0, 2).toUpperCase()}</span>
      <strong>${name}</strong>
    </a>
  `).join("");
}

function renderContact() {
  $("#contactAddress").textContent = data.settings.address;
  $("#footerAddress").textContent = data.settings.address;
  $("#contactPhone").textContent = data.settings.phone;
  $("#contactPhone").href = phoneHref(data.settings.phone);
  $("#whatsappBtn").href = whatsappHref(data.settings.phone);
  $("#floatingWhatsapp").href = whatsappHref(data.settings.phone);
}

function setupReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) entry.target.classList.add("visible");
    });
  }, { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));
}

function render() {
  renderDesign();
  applyLanguage();
  renderHero();
  renderBanners();
  renderCategories();
  renderMenu();
  renderOffers();
  renderGallery();
  renderHours();
  renderReviews();
  renderSocials();
  renderContact();
}

async function refreshDataAndRender() {
  setStatus("Loading fresh menu and offers...", false);
  try {
    data = await fetchPublicSiteData();
    setStatus("", false);
  } catch (error) {
    console.warn("Supabase unavailable, using local fallback.", error);
    data = loadSiteData();
    setStatus("Could not load live content. Showing saved fallback content.", true);
  }
  render();
}

async function setupRealtime() {
  unsubscribeRealtime = await subscribeToPublicUpdates((updatedData) => {
    if (updatedData) {
      data = updatedData;
      render();
      return;
    }
    refreshDataAndRender();
  });
}

function setStatus(message, isError) {
  const status = $("#siteStatus");
  if (!status) return;
  status.textContent = message;
  status.classList.toggle("error", Boolean(isError));
  status.classList.toggle("visible", Boolean(message));
}

function encodeAttr(value) {
  return String(value).replace(/"/g, "&quot;");
}

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => {
    lang = button.dataset.lang;
    localStorage.setItem("shawarma-time-lang", lang);
    render();
  });
});

$(".nav-toggle").addEventListener("click", () => {
  const nav = $(".main-nav");
  const expanded = nav.classList.toggle("open");
  $(".nav-toggle").setAttribute("aria-expanded", String(expanded));
});

$(".lightbox-close").addEventListener("click", () => $("#lightbox").close());
$("#lightbox").addEventListener("click", (event) => {
  if (event.target.id === "lightbox") $("#lightbox").close();
});

if (document.readyState === "complete") {
  document.body.classList.add("loaded");
} else {
window.addEventListener("load", () => document.body.classList.add("loaded"), { once: true });
}
window.addEventListener("message", (event) => {
  if (event.origin !== window.location.origin || event.data?.type !== "shawarma-preview") return;
  data = event.data.data;
  renderDesign();
  applyLanguage();
  renderHero();
  renderBanners();
  renderCategories();
  renderMenu();
  renderOffers();
  renderGallery();
  renderHours();
  renderReviews();
  renderSocials();
  renderContact();
});
setupReveal();
refreshDataAndRender();
setupRealtime();
