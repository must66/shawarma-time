import { badgeOptions, categoryOrder, defaultSiteData, loadSiteData, saveSiteData, ui } from "./data.js";
import {
  getAdminSession,
  isFirebaseConfigured,
  loadFirebaseSiteData,
  saveFirebaseSiteData,
  signInAdmin,
  signOutAdmin,
  uploadFirebaseImage
} from "./firebaseService.js";

const $ = (selector) => document.querySelector(selector);
const langs = ["nl", "ar", "de"];
const imageAccept = ".jpg,.jpeg,.png,.webp";
const adminLangKey = "shawarma-time-admin-lang";

let siteData = loadSiteData();
let adminLang = localStorage.getItem(adminLangKey) || "nl";
if (!["nl", "ar"].includes(adminLang)) adminLang = "nl";
let currentSession;

const adminText = {
  nl: {
    brandAdmin: "Beheer",
    brandCms: "Firebase CMS",
    loginTitle: "Veilige admin login",
    username: "Gebruikersnaam of e-mail",
    password: "Wachtwoord",
    login: "Inloggen",
    logout: "Uitloggen",
    navHome: "Home",
    navMenu: "Menu",
    navOffers: "Aanbiedingen",
    navBanners: "Banners",
    navGallery: "Galerij",
    navContact: "Contact",
    navHours: "Openingstijden",
    protectedDashboard: "Beveiligd dashboard",
    viewWebsite: "Website bekijken",
    homeTitle: "Homepagina banners",
    menuTitle: "Menu-items",
    offersTitle: "Aanbiedingen",
    bannersTitle: "Banners",
    galleryTitle: "Galerij",
    contactTitle: "Restaurantinformatie",
    hoursTitle: "Openingstijden",
    saveHome: "Home opslaan",
    saveContact: "Contact opslaan",
    saveHours: "Openingstijden opslaan",
    addItem: "Item toevoegen",
    addOffer: "Aanbieding toevoegen",
    addBanner: "Banner toevoegen",
    addPhoto: "Foto toevoegen",
    role: "Rol",
    title: "Titel",
    slogan: "Slogan",
    intro: "Intro",
    about: "Over ons",
    heroImage: "Hero-afbeelding",
    phone: "Telefoon",
    address: "Adres",
    whatsappMessage: "WhatsApp-bericht",
    instagramUrl: "Instagram URL",
    tiktokUrl: "TikTok URL",
    facebookUrl: "Facebook URL",
    category: "Categorie",
    badge: "Badge",
    none: "Geen",
    type: "Type",
    price: "Prijs",
    name: "Naam",
    description: "Beschrijving",
    bannerText: "Bannertekst",
    uploadImage: "Afbeelding uploaden",
    uploadHint: "Sleep een afbeelding hierheen of tik om te kiezen. JPG, PNG, WEBP - max 5MB",
    save: "Opslaan",
    delete: "Verwijderen",
    saved: "Opgeslagen",
    saveFailed: "Opslaan mislukt",
    homepageSaved: "Homepagina opgeslagen",
    contactSaved: "Restaurantinformatie opgeslagen",
    hoursSaved: "Openingstijden opgeslagen",
    deleted: "Verwijderd",
    imageUploaded: "Afbeelding geupload",
    uploadFailed: "Upload mislukt",
    loggedOut: "Uitgelogd.",
    loginFailed: "Inloggen mislukt.",
    firebaseMissing: "Firebase-configuratie ontbreekt. Voeg de bestaande Firebase projectconfiguratie toe voordat je inlogt."
  },
  ar: {
    brandAdmin: "الإدارة",
    brandCms: "نظام Firebase",
    loginTitle: "تسجيل دخول آمن للإدارة",
    username: "اسم المستخدم أو البريد الإلكتروني",
    password: "كلمة المرور",
    login: "تسجيل الدخول",
    logout: "تسجيل الخروج",
    navHome: "الرئيسية",
    navMenu: "القائمة",
    navOffers: "العروض",
    navBanners: "البنرات",
    navGallery: "المعرض",
    navContact: "التواصل",
    navHours: "ساعات العمل",
    protectedDashboard: "لوحة إدارة محمية",
    viewWebsite: "عرض الموقع",
    homeTitle: "بنرات الصفحة الرئيسية",
    menuTitle: "عناصر القائمة",
    offersTitle: "العروض والخصومات",
    bannersTitle: "البنرات",
    galleryTitle: "معرض الصور",
    contactTitle: "معلومات المطعم",
    hoursTitle: "ساعات العمل",
    saveHome: "حفظ الرئيسية",
    saveContact: "حفظ التواصل",
    saveHours: "حفظ ساعات العمل",
    addItem: "إضافة صنف",
    addOffer: "إضافة عرض",
    addBanner: "إضافة بنر",
    addPhoto: "إضافة صورة",
    role: "الدور",
    title: "العنوان",
    slogan: "الشعار",
    intro: "المقدمة",
    about: "من نحن",
    heroImage: "صورة الواجهة",
    phone: "الهاتف",
    address: "العنوان",
    whatsappMessage: "رسالة واتساب",
    instagramUrl: "رابط إنستغرام",
    tiktokUrl: "رابط تيك توك",
    facebookUrl: "رابط فيسبوك",
    category: "التصنيف",
    badge: "الشارة",
    none: "بدون",
    type: "النوع",
    price: "السعر",
    name: "الاسم",
    description: "الوصف",
    bannerText: "نص البنر",
    uploadImage: "رفع صورة",
    uploadHint: "اسحب الصورة هنا أو اضغط للاختيار. JPG و PNG و WEBP - الحد الأقصى 5MB",
    save: "حفظ",
    delete: "حذف",
    saved: "تم الحفظ",
    saveFailed: "فشل الحفظ",
    homepageSaved: "تم حفظ الصفحة الرئيسية",
    contactSaved: "تم حفظ معلومات المطعم",
    hoursSaved: "تم حفظ ساعات العمل",
    deleted: "تم الحذف",
    imageUploaded: "تم رفع الصورة",
    uploadFailed: "فشل رفع الصورة",
    loggedOut: "تم تسجيل الخروج.",
    loginFailed: "فشل تسجيل الدخول.",
    firebaseMissing: "إعدادات Firebase غير موجودة. أضف إعدادات مشروع Firebase قبل تسجيل الدخول."
  }
};

function tr(key) {
  return adminText[adminLang]?.[key] || adminText.nl[key] || key;
}

function applyAdminLanguage() {
  document.documentElement.lang = adminLang;
  document.documentElement.dir = adminLang === "ar" ? "rtl" : "ltr";
  document.querySelectorAll("[data-admin-lang]").forEach((node) => {
    node.classList.toggle("active", node.dataset.adminLang === adminLang);
  });
  document.querySelectorAll("[data-admin-i18n]").forEach((node) => {
    node.textContent = tr(node.dataset.adminI18n);
  });
  renderRole();
}

function renderRole() {
  if (!currentSession || !$("#adminRole")) return;
  $("#adminRole").textContent = `${tr("role")}: ${currentSession?.admin?.role || currentSession?.role || "owner"}`;
}

function localizedError(error, fallbackKey) {
  const message = error?.message || "";
  if (message.includes("Firebase is not configured")) return tr("firebaseMissing");
  if (message.includes("Username or password") || message.includes("incorrect")) return adminLang === "ar" ? "اسم المستخدم أو كلمة المرور غير صحيحة." : "Gebruikersnaam of wachtwoord is onjuist.";
  if (message.includes("Admin user was not found")) return adminLang === "ar" ? "لم يتم العثور على حساب الإدارة." : "Admin-gebruiker niet gevonden.";
  if (message.includes("Enable Email/Password")) return adminLang === "ar" ? "فعّل تسجيل الدخول بالبريد وكلمة المرور في Firebase Authentication." : "Schakel e-mail/wachtwoord-login in bij Firebase Authentication.";
  if (message.includes("Could not reach Firebase")) return adminLang === "ar" ? "تعذر الاتصال بـ Firebase. تحقق من الاتصال والإعدادات." : "Kan Firebase niet bereiken. Controleer de verbinding en instellingen.";
  if (message.includes("No image selected")) return adminLang === "ar" ? "لم يتم اختيار صورة." : "Geen afbeelding geselecteerd.";
  if (message.includes("Only JPG")) return adminLang === "ar" ? "يسمح فقط بصور JPG و PNG و WEBP." : "Alleen JPG-, PNG- en WEBP-afbeeldingen zijn toegestaan.";
  if (message.includes("too large")) return adminLang === "ar" ? "الصورة كبيرة جدًا. الحد الأقصى 5MB." : "Afbeelding is te groot. Maximaal 5MB.";
  return message || tr(fallbackKey);
}

function note(message) {
  $("#saveStatus").textContent = message;
  $("#adminToast").textContent = message;
  $("#adminToast").classList.add("visible");
  clearTimeout(note.timer);
  note.timer = setTimeout(() => {
    $("#saveStatus").textContent = "";
    $("#adminToast").classList.remove("visible");
  }, 2200);
}

function loading(active) {
  $("#adminLoader").classList.toggle("hidden", !active);
}

function showLogin(message = "") {
  $("#loginView").classList.remove("hidden");
  $("#dashboardView").classList.add("hidden");
  $("#loginNote").textContent = message;
}

async function showDashboard(session) {
  currentSession = session;
  $("#loginView").classList.add("hidden");
  $("#dashboardView").classList.remove("hidden");
  renderRole();
  siteData = await loadContent();
  renderAll();
}

async function loadContent() {
  if (!isFirebaseConfigured()) return loadSiteData();
  return loadFirebaseSiteData();
}

async function saveContent(message = tr("saved")) {
  loading(true);
  try {
    await saveFirebaseSiteData(siteData);
    if (!isFirebaseConfigured()) saveSiteData(siteData);
    renderAll();
    note(message);
  } catch (error) {
    note(localizedError(error, "saveFailed"));
  } finally {
    loading(false);
  }
}

$("#loginForm").addEventListener("submit", async (event) => {
  event.preventDefault();
  loading(true);
  try {
    const form = new FormData(event.currentTarget);
    const session = await signInAdmin(form.get("username"), form.get("password"));
    await showDashboard(session);
  } catch (error) {
    showLogin(localizedError(error, "loginFailed"));
  } finally {
    loading(false);
  }
});

$("#logoutBtn").addEventListener("click", async () => {
  await signOutAdmin();
  currentSession = null;
  showLogin(tr("loggedOut"));
});

document.querySelectorAll(".admin-sidebar nav button").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".admin-sidebar nav button, .admin-panel").forEach((node) => node.classList.remove("active"));
    button.classList.add("active");
    $(`#${button.dataset.panel}`).classList.add("active");
  });
});

document.querySelectorAll("[data-admin-lang]").forEach((button) => {
  button.addEventListener("click", () => {
    adminLang = button.dataset.adminLang;
    localStorage.setItem(adminLangKey, adminLang);
    applyAdminLanguage();
    renderAll();
  });
});

document.querySelectorAll("[data-add]").forEach((button) => {
  button.addEventListener("click", () => {
    const collection = button.dataset.add;
    siteData[collection].unshift(blankItem(collection));
    renderAll();
  });
});

$("#saveHomeBtn").addEventListener("click", () => {
  collectFields($("#homeForm"), siteData.homepage);
  saveContent(tr("homepageSaved"));
});

$("#saveContactBtn").addEventListener("click", () => {
  collectFields($("#contactForm"), siteData.settings);
  saveContent(tr("contactSaved"));
});

$("#saveHoursBtn").addEventListener("click", () => {
  collectFields($("#hoursForm"), siteData.settings);
  saveContent(tr("hoursSaved"));
});

function renderAll() {
  renderHome();
  renderCollection("menu", "menuEditor", { category: true, badge: true, price: true, desc: true, folder: "menu" });
  renderCollection("offers", "offersEditor", { type: true, price: true, desc: true, folder: "offers" });
  renderCollection("banners", "bannersEditor", { title: true, text: true, folder: "banners" });
  renderCollection("gallery", "galleryEditor", { title: true, type: true, folder: "gallery" });
  renderContact();
  renderHours();
  setupUploads();
}

function renderHome() {
  $("#homeForm").innerHTML = `
    ${multiInput(siteData.homepage, "title", tr("title"))}
    ${multiInput(siteData.homepage, "slogan", tr("slogan"), "textarea")}
    ${multiInput(siteData.homepage, "intro", tr("intro"), "textarea")}
    ${multiInput(siteData.homepage, "about", tr("about"), "textarea")}
    ${uploadLabel(tr("heroImage"), "data-home-image")}
  `;
  $("[data-home-image]").addEventListener("change", async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadToField(file, siteData.homepage, "heroImage", "hero");
    event.target.value = "";
  });
}

function renderContact() {
  $("#contactForm").innerHTML = `
    ${field("phone", tr("phone"), siteData.settings.phone || "")}
    ${field("address", tr("address"), siteData.settings.address || "", "wide")}
    ${field("whatsappMessage", tr("whatsappMessage"), siteData.settings.whatsappMessage || "", "wide")}
    ${field("instagram", tr("instagramUrl"), siteData.settings.instagram || "")}
    ${field("tiktok", tr("tiktokUrl"), siteData.settings.tiktok || "")}
    ${field("facebook", tr("facebookUrl"), siteData.settings.facebook || "")}
  `;
}

function renderHours() {
  const days = ui[adminLang].days || ui.nl.days;
  $("#hoursForm").innerHTML = `
    <div class="hours-editor">
      ${days.map((day, index) => `
        <label>
          <span>${day}</span>
          <input data-field="hours.${index}" value="${escapeAttr(siteData.settings.hours?.[index] || "")}" />
        </label>
      `).join("")}
    </div>
  `;
}

function renderCollection(collection, rootId, options) {
  const root = $(`#${rootId}`);
  root.innerHTML = siteData[collection].map((item) => editorCard(collection, item, options)).join("");
  root.querySelectorAll("[data-save]").forEach((button) => {
    button.addEventListener("click", () => saveEditor(collection, button.closest(".editor-card"), options));
  });
  root.querySelectorAll("[data-delete]").forEach((button) => {
    button.addEventListener("click", () => {
      siteData[collection] = siteData[collection].filter((item) => item.id !== button.closest(".editor-card").dataset.id);
      saveContent(tr("deleted"));
    });
  });
  root.querySelectorAll("[data-image]").forEach((input) => {
    input.addEventListener("change", async (event) => {
      const file = event.target.files?.[0];
      if (!file) return;
      const item = siteData[collection].find((entry) => entry.id === input.closest(".editor-card").dataset.id);
      await uploadToField(file, item, "image", options.folder);
      event.target.value = "";
    });
  });
}

function editorCard(collection, item, options) {
  return `
    <article class="admin-card editor-card" data-id="${item.id}">
      <img src="${item.image || siteData.homepage.heroImage}" alt="" data-preview />
      <div class="editor-fields">
        ${options.category ? categorySelect(item) : ""}
        ${options.badge ? badgeSelect(item) : ""}
        ${options.type ? field("type", tr("type"), item.type || "") : ""}
        ${options.price ? field("price", tr("price"), item.price || "") : ""}
        ${multiInput(item, options.title ? "title" : "name", options.title ? tr("title") : tr("name"))}
        ${options.desc ? multiInput(item, "desc", tr("description"), "textarea") : ""}
        ${options.text ? multiInput(item, "text", tr("bannerText"), "textarea") : ""}
        ${uploadLabel(tr("uploadImage"), "data-image")}
      </div>
      <div class="editor-actions">
        <button class="btn primary" type="button" data-save>${tr("save")}</button>
        <button class="btn ghost danger" type="button" data-delete>${tr("delete")}</button>
      </div>
    </article>
  `;
}

function saveEditor(collection, card) {
  const item = siteData[collection].find((entry) => entry.id === card.dataset.id);
  collectFields(card, item);
  saveContent(tr("saved"));
}

function collectFields(root, item) {
  root.querySelectorAll("[data-field]").forEach((input) => {
    setNested(item, input.dataset.field, input.value);
  });
}

function multiInput(item, fieldName, label, type = "input") {
  return langs.map((lang) => {
    const value = item[fieldName]?.[lang] || "";
    return type === "textarea"
      ? `<label class="wide"><span>${label} ${lang.toUpperCase()}</span><textarea data-field="${fieldName}.${lang}">${escapeHtml(value)}</textarea></label>`
      : `<label><span>${label} ${lang.toUpperCase()}</span><input data-field="${fieldName}.${lang}" value="${escapeAttr(value)}" /></label>`;
  }).join("");
}

function field(fieldName, label, value, className = "") {
  return `<label class="${className}"><span>${label}</span><input data-field="${fieldName}" value="${escapeAttr(value)}" /></label>`;
}

function uploadLabel(label, attribute) {
  return `<label class="wide upload-label"><span>${label}</span><small>${tr("uploadHint")}</small><input ${attribute} type="file" accept="${imageAccept}" /></label>`;
}

function categorySelect(item) {
  return `<label><span>${tr("category")}</span><select data-field="category">${categoryOrder.map((cat) => `<option value="${cat}" ${item.category === cat ? "selected" : ""}>${ui[adminLang].categories[cat]}</option>`).join("")}</select></label>`;
}

function badgeSelect(item) {
  return `<label><span>${tr("badge")}</span><select data-field="badge">${badgeOptions.map((badge) => `<option value="${badge}" ${item.badge === badge ? "selected" : ""}>${badge ? (ui[adminLang].badges[badge] || badge) : tr("none")}</option>`).join("")}</select></label>`;
}

async function uploadToField(file, item, fieldName, folder) {
  loading(true);
  try {
    const preview = document.querySelector(`[data-id="${item.id}"] [data-preview]`);
    if (preview) preview.src = await fileToDataUrl(file);
    item[fieldName] = await uploadFirebaseImage(file, folder);
    await saveContent(tr("imageUploaded"));
  } catch (error) {
    note(localizedError(error, "uploadFailed"));
  } finally {
    loading(false);
  }
}

function setupUploads() {
  document.querySelectorAll(".upload-label").forEach((label) => {
    if (label.dataset.dropReady) return;
    label.dataset.dropReady = "true";
    ["dragenter", "dragover"].forEach((eventName) => {
      label.addEventListener(eventName, (event) => {
        event.preventDefault();
        label.classList.add("drag-over");
      });
    });
    ["dragleave", "drop"].forEach((eventName) => {
      label.addEventListener(eventName, (event) => {
        event.preventDefault();
        label.classList.remove("drag-over");
      });
    });
    label.addEventListener("drop", async (event) => {
      const file = event.dataTransfer?.files?.[0];
      const input = label.querySelector("input[type='file']");
      if (!file || !input) return;
      if (input.hasAttribute("data-home-image")) {
        await uploadToField(file, siteData.homepage, "heroImage", "hero");
        return;
      }
      const card = input.closest(".editor-card");
      if (!card) return;
      const collection = card.closest(".editor-list")?.id?.replace("Editor", "");
      const item = siteData[collection]?.find((entry) => entry.id === card.dataset.id);
      if (item) await uploadToField(file, item, "image", collection || "uploads");
    });
  });
}

function blankItem(collection) {
  const id = `${collection}-${Date.now()}`;
  const baseImage = siteData.homepage.heroImage;
  const blank = { nl: "", ar: "", de: "" };
  return {
    menu: { id, category: "shawarma", badge: "", price: "EUR 0,00", name: { ...blank }, desc: { ...blank }, image: baseImage },
    offers: { id, type: "daily", price: "EUR 0,00", name: { ...blank }, desc: { ...blank }, image: baseImage },
    banners: { id, title: { ...blank }, text: { ...blank }, image: baseImage },
    gallery: { id, type: "food", title: { ...blank }, image: baseImage }
  }[collection];
}

function setNested(target, path, value) {
  const parts = path.split(".");
  let ref = target;
  while (parts.length > 1) {
    const key = parts.shift();
    const nextKey = parts[0];
    if (Array.isArray(ref[key]) || /^\d+$/.test(nextKey)) ref[key] ||= [];
    else ref[key] ||= {};
    ref = ref[key];
  }
  ref[parts[0]] = value;
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function escapeHtml(value) {
  return String(value).replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" })[char]);
}

function escapeAttr(value) {
  return escapeHtml(value);
}

applyAdminLanguage();
getAdminSession().then((session) => {
  if (session) showDashboard(session);
  else showLogin(isFirebaseConfigured() ? "" : tr("firebaseMissing"));
});
