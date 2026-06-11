import { categoryOrder, loadSiteData, localized, ui } from "./data.js";
import { fetchPublicSiteData, subscribeToPublicUpdates } from "./publicApi.js";
import { createFirebaseOrder } from "./firebaseService.js";
import { paymentConfig } from "./paymentConfig.js";

let lang = localStorage.getItem("shawarma-time-lang") || "nl";
let activeCategory = "all";
let data = loadSiteData();
let unsubscribeRealtime = null;
let cart = [];

const $ = (selector) => document.querySelector(selector);
const routeSections = {
  "/": "home",
  "/menu": "menu",
  "/offers": "offers",
  "/gallery": "gallery",
  "/checkout": "checkout",
  "/success": "success",
  "/about": "about",
  "/hours": "hours",
  "/contact": "contact",
  "/reviews": "reviews",
  "/socials": "socials"
};
const orderingUi = {
  nl: {
    sectionText: {
      footer: "Shawarma Time Venlo. Online bestellen, iDEAL betalen en snel afhalen."
    },
    section: {
      addedToCart: "is toegevoegd aan je winkelwagen.",
      checkout: "Checkout",
      checkoutEyebrow: "Veilig bestellen",
      checkoutTitle: "Rond je bestelling af",
      checkoutIntro: "Vul je gegevens in, kies je betaalmethode en bevestig je bestelling.",
      yourOrder: "Jouw bestelling",
      addMore: "Meer toevoegen",
      goToCheckout: "Naar checkout",
      idealPayment: "iDEAL online betalen",
      mollieWallets: "iDEAL, Apple Pay, Google Pay en kaart via Mollie",
      orderConfirmed: "Bestelling bevestigd",
      thankYou: "Bedankt voor je bestelling",
      orderNumber: "Ordernummer",
      prepTime: "Bereidingstijd",
      defaultPrepTime: "20-30 min",
      successMessage: "We gaan direct voor je aan de slag. Totaal:",
      successOnlineMessage: "Je betaling is ontvangen. De bestelling wordt automatisch doorgestuurd naar de keuken.",
      onlineOrderNumber: "Online betaald",
      backToMenu: "Terug naar menu"
    }
  },
  ar: {
    sectionText: {
      footer: "شاورما تايم فينلو. اطلب أونلاين وادفع عبر iDEAL واستلم بسرعة."
    },
    section: {
      addedToCart: "تمت إضافته إلى سلة الطلب.",
      checkout: "إتمام الطلب",
      checkoutEyebrow: "طلب آمن",
      checkoutTitle: "أكمل طلبك",
      checkoutIntro: "أدخل بياناتك، اختر طريقة الدفع وأكد طلبك.",
      yourOrder: "طلبك",
      addMore: "أضف المزيد",
      goToCheckout: "إلى الدفع",
      idealPayment: "الدفع أونلاين عبر iDEAL",
      mollieWallets: "iDEAL و Apple Pay و Google Pay والبطاقة عبر Mollie",
      orderConfirmed: "تم تأكيد الطلب",
      thankYou: "شكراً لطلبك",
      orderNumber: "رقم الطلب",
      prepTime: "وقت التحضير",
      defaultPrepTime: "20-30 دقيقة",
      successMessage: "سنبدأ بتحضير طلبك فوراً. المجموع:",
      successOnlineMessage: "تم استلام الدفع. سيتم إرسال الطلب تلقائياً إلى المطبخ.",
      onlineOrderNumber: "دفع أونلاين",
      backToMenu: "العودة إلى القائمة"
    }
  },
  de: {
    sectionText: {
      footer: "Shawarma Time Venlo. Online bestellen, mit iDEAL bezahlen und schnell abholen."
    },
    section: {
      addedToCart: "wurde in den Warenkorb gelegt.",
      checkout: "Checkout",
      checkoutEyebrow: "Sicher bestellen",
      checkoutTitle: "Bestellung abschliessen",
      checkoutIntro: "Gib deine Daten ein, waehle die Zahlung und bestaetige die Bestellung.",
      yourOrder: "Deine Bestellung",
      addMore: "Mehr hinzufuegen",
      goToCheckout: "Zum Checkout",
      idealPayment: "Online mit iDEAL bezahlen",
      mollieWallets: "iDEAL, Apple Pay, Google Pay und Karte via Mollie",
      orderConfirmed: "Bestellung bestaetigt",
      thankYou: "Danke fuer deine Bestellung",
      orderNumber: "Bestellnummer",
      prepTime: "Zubereitungszeit",
      defaultPrepTime: "20-30 min",
      successMessage: "Wir beginnen direkt mit deiner Bestellung. Summe:",
      successOnlineMessage: "Die Zahlung wurde empfangen. Die Bestellung wird automatisch an die Kueche gesendet.",
      onlineOrderNumber: "Online bezahlt",
      backToMenu: "Zurueck zum Menue"
    }
  }
};

function t(path) {
  const keys = path.split(".");
  return keys.reduce((value, key) => value?.[key], orderingUi[lang])
    || keys.reduce((value, key) => value?.[key], ui[lang])
    || path;
}

function appBasePath() {
  return window.location.pathname.startsWith("/shawarma-time") ? "/shawarma-time" : "";
}

function currentRoute() {
  const base = appBasePath();
  let route = window.location.pathname.slice(base.length).replace(/\/+$/, "") || "/";
  if (!route.startsWith("/")) route = `/${route}`;
  return routeSections[route] ? route : "/";
}

function routeUrl(route) {
  const base = appBasePath();
  return `${base}${route === "/" ? "/" : route}`;
}

function navigateToRoute(route, behavior = "smooth") {
  if (!routeSections[route]) return;
  window.history.pushState({ route }, "", routeUrl(route));
  scrollToRoute(route, behavior);
}

function scrollToRoute(route = currentRoute(), behavior = "smooth") {
  const section = document.getElementById(routeSections[route] || "home");
  if (!section) return;
  section.scrollIntoView({ behavior, block: "start" });
  document.querySelectorAll("[data-route]").forEach((link) => {
    link.classList.toggle("active", link.dataset.route === route);
  });
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
    el.textContent = orderingUi[lang]?.sectionText?.[el.dataset.sectionText]
      || localized(data.sectionText?.[el.dataset.sectionText], lang);
  });
  renderCart();
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
        <div class="food-card-bottom">
          <strong>${item.price}</strong>
          <button class="btn tiny add-button" type="button" data-add-cart="${encodeAttr(item.id)}">${t("section.addToCart")}</button>
        </div>
      </div>
    </article>
  `;
}

function renderMenu() {
  const items = activeCategory === "all" ? data.menu : data.menu.filter((item) => item.category === activeCategory);
  $("#menuGrid").innerHTML = items.map(itemCard).join("");
  $("#menuGrid").querySelectorAll("[data-add-cart]").forEach((button) => {
    button.addEventListener("click", () => addToCart(button.dataset.addCart));
  });
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

function addToCart(itemId) {
  const item = data.menu.find((entry) => entry.id === itemId);
  if (!item) return;
  const existing = cart.find((entry) => entry.id === itemId);
  if (existing) existing.quantity += 1;
  else cart.push({
    id: item.id,
    name: localized(item.name, lang),
    price: item.price,
    priceValue: priceNumber(item.price),
    image: item.image,
    quantity: 1
  });
  renderCart();
  setStatus(`${localized(item.name, lang)} ${t("section.addedToCart")}`, false);
}

function priceNumber(price) {
  const normalized = String(price || "").replace(/[^\d,.-]/g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? value : 0;
}

function cartTotal() {
  return cart.reduce((sum, item) => sum + item.priceValue * item.quantity, 0);
}

function renderCart() {
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartCount = $("#cartCount");
  if (cartCount) cartCount.textContent = String(count);
  const mobileCartCount = $("#mobileCartCount");
  if (mobileCartCount) mobileCartCount.textContent = String(count);
  $("#cartOpen")?.classList.toggle("has-items", count > 0);
  const title = $("#cartTitle");
  if (title) title.textContent = t("section.cart");
  const list = $("#cartItems");
  if (!list) return;
  if (!cart.length) {
    list.innerHTML = `<p class="cart-empty">${t("section.cartEmpty")}</p>`;
  } else {
    list.innerHTML = cart.map((item) => `
      <article class="cart-item" data-cart-id="${encodeAttr(item.id)}">
        <img src="${item.image}" alt="${encodeAttr(item.name)}" loading="lazy" decoding="async" />
        <div>
          <strong>${item.name}</strong>
          <span>${item.price}</span>
          <div class="quantity-control" aria-label="${t("section.quantity")}">
            <button type="button" data-cart-dec="${encodeAttr(item.id)}">-</button>
            <b>${item.quantity}</b>
            <button type="button" data-cart-inc="${encodeAttr(item.id)}">+</button>
          </div>
        </div>
        <button class="cart-remove" type="button" data-cart-remove="${encodeAttr(item.id)}" aria-label="${t("section.close")}">×</button>
      </article>
    `).join("");
  }
  $("#cartSubtotalLabel").textContent = t("section.subtotal");
  $("#cartSubtotal").textContent = euro(cartTotal());
  $("#goCheckoutBtn").textContent = t("section.goToCheckout");
  $("#goCheckoutBtn").disabled = !cart.length;
  $("#cartClose").setAttribute("aria-label", t("section.closeCart"));
  list.querySelectorAll("[data-cart-inc]").forEach((button) => button.addEventListener("click", () => changeQuantity(button.dataset.cartInc, 1)));
  list.querySelectorAll("[data-cart-dec]").forEach((button) => button.addEventListener("click", () => changeQuantity(button.dataset.cartDec, -1)));
  list.querySelectorAll("[data-cart-remove]").forEach((button) => button.addEventListener("click", () => removeFromCart(button.dataset.cartRemove)));
  renderCheckout();
}

function renderCheckout() {
  const checkoutItems = $("#checkoutItems");
  if (!checkoutItems) return;
  $("#checkoutNameLabel").textContent = t("section.customerName");
  $("#checkoutPhoneLabel").textContent = t("section.customerPhone");
  $("#checkoutNotesLabel").textContent = t("section.orderNotes");
  $("#checkoutPaymentMethodLabel").textContent = t("section.paymentMethod");
  $("#checkoutMollieLabel").textContent = t("section.idealPayment");
  $("#checkoutMollieNote").textContent = t("section.mollieWallets");
  $("#checkoutCashLabel").textContent = t("section.cashOnDelivery");
  $("#checkoutRestaurantLabel").textContent = t("section.payAtRestaurant");
  $("#submitOrderBtn").textContent = t("section.submitOrder");
  $("#checkoutSubtotalLabel").textContent = t("section.subtotal");
  $("#checkoutSubtotal").textContent = euro(cartTotal());
  checkoutItems.innerHTML = cart.length ? cart.map((item) => `
    <article class="checkout-item">
      <img src="${item.image}" alt="${encodeAttr(item.name)}" loading="lazy" decoding="async" />
      <div>
        <strong>${item.name}</strong>
        <span>${item.quantity} x ${item.price}</span>
      </div>
      <b>${euro(item.priceValue * item.quantity)}</b>
    </article>
  `).join("") : `<p class="cart-empty">${t("section.cartEmpty")}</p>`;
}

function euro(value) {
  return new Intl.NumberFormat(lang === "de" ? "de-DE" : "nl-NL", { style: "currency", currency: "EUR" }).format(value);
}

function changeQuantity(itemId, delta) {
  cart = cart.map((item) => item.id === itemId ? { ...item, quantity: item.quantity + delta } : item)
    .filter((item) => item.quantity > 0);
  renderCart();
}

function removeFromCart(itemId) {
  cart = cart.filter((item) => item.id !== itemId);
  renderCart();
}

function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#cartBackdrop").classList.add("open");
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#cartBackdrop").classList.remove("open");
}

async function submitCart(event) {
  event.preventDefault();
  if (!cart.length) {
    setStatus(t("section.cartEmpty"), true);
    return;
  }
  const cartForm = event.currentTarget;
  const form = new FormData(cartForm);
  const paymentMethod = form.get("paymentMethod") || "cash";
  setStatus(t("section.submitOrder"), false);
  $("#submitOrderBtn").disabled = true;
  try {
    const orderPayload = {
      items: cart,
      customer: {
        name: form.get("name"),
        phone: form.get("phone"),
        notes: form.get("notes")
      },
      paymentMethod
    };
    if (paymentMethod === "mollie") {
      setStatus(t("section.mollieRedirect"), false);
      await redirectToMolliePayment(orderPayload);
      return;
    }
    const total = cartTotal();
    const orderId = await createFirebaseOrder(orderPayload);
    notifyOrderCreated(orderId, orderPayload, total);
    showOrderSuccess(orderId, total, paymentMethod);
    cart = [];
    cartForm.reset();
    renderCart();
  } catch (error) {
    console.error(error);
    setStatus(error?.message || t("section.orderError"), true);
  } finally {
    $("#submitOrderBtn").disabled = false;
  }
}

function showOrderSuccess(orderId, total, paymentMethod) {
  const orderNumber = formatOrderNumber(orderId);
  const successData = {
    orderId,
    orderNumber,
    prepTime: t("section.defaultPrepTime"),
    total,
    paymentMethod,
    createdAt: new Date().toISOString()
  };
  sessionStorage.setItem("shawarma-time-last-order", JSON.stringify(successData));
  renderSuccess(successData);
  closeCart();
  navigateToRoute("/success", "auto");
  setStatus(t("section.orderSuccess"), false);
}

function renderSuccess(successData = getLastOrder()) {
  const number = successData?.orderNumber || "-";
  $("#successOrderNumber").textContent = number;
  $("#successPrepTime").textContent = successData?.prepTime || t("section.defaultPrepTime");
  $("#successMessage").textContent = number === "-"
    ? t("section.successOnlineMessage")
    : `${t("section.successMessage")} ${euro(Number(successData.total || 0))}`;
}

function getLastOrder() {
  try {
    return JSON.parse(sessionStorage.getItem("shawarma-time-last-order") || "null");
  } catch {
    return null;
  }
}

function formatOrderNumber(orderId) {
  return `ST-${String(orderId || Date.now()).replace(/[^a-z0-9]/gi, "").slice(0, 6).toUpperCase()}`;
}

async function notifyOrderCreated(orderId, orderPayload, total = cartTotal()) {
  const endpoint = paymentConfig.orderNotificationEndpoint;
  if (!endpoint) return;
  try {
    await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        orderId,
        order: {
          ...orderPayload,
          subtotal: total,
          currency: "EUR"
        }
      })
    });
  } catch (error) {
    console.warn("Order notification could not be sent.", error);
  }
}

async function redirectToStripeCheckout(orderPayload) {
  const endpoint = paymentConfig.stripeCheckoutEndpoint;
  if (!endpoint) throw new Error(t("section.stripeUnavailable"));
  await assertStripeReady();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      order: {
        ...orderPayload,
        subtotal: cartTotal(),
        currency: "EUR"
      },
      successUrl: new URL("payment-success.html", window.location.href).toString(),
      cancelUrl: `${window.location.origin}${window.location.pathname}?payment=cancel`
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.url) {
    throw new Error(payload.error || t("section.stripeUnavailable"));
  }
  window.location.href = payload.url;
}

async function redirectToMolliePayment(orderPayload) {
  const endpoint = paymentConfig.molliePaymentEndpoint;
  if (!endpoint) throw new Error(t("section.mollieUnavailable"));
  await assertMollieReady();
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      order: {
        ...orderPayload,
        paymentMethod: "mollie",
        subtotal: cartTotal(),
        currency: "EUR"
      },
      redirectUrl: new URL(`${routeUrl("/success")}?payment=success`, window.location.origin).toString(),
      cancelUrl: `${window.location.origin}${window.location.pathname}?payment=cancel`
    })
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload.url) {
    throw new Error(payload.error || t("section.mollieUnavailable"));
  }
  window.location.href = payload.url;
}

async function assertMollieReady() {
  const endpoint = paymentConfig.mollieConfigStatusEndpoint;
  if (!endpoint) return;
  let response;
  try {
    response = await fetch(endpoint, { headers: { accept: "application/json" } });
  } catch {
    throw new Error(t("section.mollieMissingBackend"));
  }
  if (!response.ok) throw new Error(t("section.mollieMissingBackend"));
  const status = await response.json().catch(() => null);
  const missing = [];
  if (!status?.mollieApiKey) missing.push("MOLLIE_API_KEY");
  if (!status?.firebaseServiceAccount) missing.push("FIREBASE_SERVICE_ACCOUNT");
  if (missing.length) throw new Error(`${t("section.mollieMissingConfig")} Missing: ${missing.join(", ")}`);
}

async function assertStripeReady() {
  const endpoint = paymentConfig.stripeConfigStatusEndpoint;
  if (!endpoint) return;
  let response;
  try {
    response = await fetch(endpoint, { headers: { accept: "application/json" } });
  } catch {
    throw new Error(t("section.stripeMissingBackend"));
  }
  if (!response.ok) throw new Error(t("section.stripeMissingBackend"));
  const status = await response.json().catch(() => null);
  const missing = [];
  if (!status?.stripeSecretKey) missing.push("STRIPE_SECRET_KEY");
  if (!status?.stripePublishableKey) missing.push("STRIPE_PUBLISHABLE_KEY");
  if (!status?.stripeWebhookSecret) missing.push("STRIPE_WEBHOOK_SECRET");
  if (!status?.firebaseServiceAccount) missing.push("FIREBASE_SERVICE_ACCOUNT");
  if (missing.length) throw new Error(`${t("section.stripeMissingConfig")} Missing: ${missing.join(", ")}`);
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
  renderCheckout();
  renderSuccess();
  renderPaymentReturnMessage();
  window.requestAnimationFrame(() => scrollToRoute(currentRoute(), "auto"));
}

function renderPaymentReturnMessage() {
  const params = new URLSearchParams(window.location.search);
  const payment = params.get("payment");
  if (payment === "success") {
    renderSuccess({
      orderNumber: t("section.onlineOrderNumber"),
      prepTime: t("section.defaultPrepTime")
    });
    setStatus(t("section.paymentSuccess"), false);
  }
  if (payment === "cancel") setStatus(t("section.paymentCancel"), true);
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

document.querySelectorAll("[data-route]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const route = link.dataset.route || "/";
  if (!routeSections[route]) return;
  event.preventDefault();
    navigateToRoute(route);
    $(".main-nav")?.classList.remove("open");
    $(".nav-toggle")?.setAttribute("aria-expanded", "false");
  });
});

window.addEventListener("popstate", () => scrollToRoute(currentRoute()));

$(".nav-toggle").addEventListener("click", () => {
  const nav = $(".main-nav");
  const expanded = nav.classList.toggle("open");
  $(".nav-toggle").setAttribute("aria-expanded", String(expanded));
});

$(".lightbox-close").addEventListener("click", () => $("#lightbox").close());
$("#lightbox").addEventListener("click", (event) => {
  if (event.target.id === "lightbox") $("#lightbox").close();
});

$("#cartOpen").addEventListener("click", openCart);
$("#mobileCartBtn").addEventListener("click", openCart);
$("#cartClose").addEventListener("click", closeCart);
$("#cartBackdrop").addEventListener("click", closeCart);
$("#goCheckoutBtn").addEventListener("click", () => {
  if (!cart.length) {
    setStatus(t("section.cartEmpty"), true);
    return;
  }
  closeCart();
  navigateToRoute("/checkout");
});
$("#checkoutForm").addEventListener("submit", submitCart);

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
