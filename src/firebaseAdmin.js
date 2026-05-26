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

let siteData = loadSiteData();
let adminLang = "nl";

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
  $("#loginView").classList.add("hidden");
  $("#dashboardView").classList.remove("hidden");
  $("#adminRole").textContent = `Role: ${session?.admin?.role || session?.role || "owner"}`;
  siteData = await loadContent();
  renderAll();
}

async function loadContent() {
  if (!isFirebaseConfigured()) return loadSiteData();
  return loadFirebaseSiteData();
}

async function saveContent(message = "Saved") {
  loading(true);
  try {
    await saveFirebaseSiteData(siteData);
    if (!isFirebaseConfigured()) saveSiteData(siteData);
    renderAll();
    note(message);
  } catch (error) {
    note(error.message || "Save failed");
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
    showLogin(error.message || "Login failed.");
  } finally {
    loading(false);
  }
});

$("#logoutBtn").addEventListener("click", async () => {
  await signOutAdmin();
  showLogin("Logged out.");
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
    document.documentElement.lang = adminLang;
    document.documentElement.dir = adminLang === "ar" ? "rtl" : "ltr";
    document.querySelectorAll("[data-admin-lang]").forEach((node) => node.classList.toggle("active", node.dataset.adminLang === adminLang));
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
  saveContent("Homepage saved");
});

$("#saveContactBtn").addEventListener("click", () => {
  collectFields($("#contactForm"), siteData.settings);
  saveContent("Restaurant information saved");
});

$("#saveHoursBtn").addEventListener("click", () => {
  collectFields($("#hoursForm"), siteData.settings);
  saveContent("Opening hours saved");
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
    ${multiInput(siteData.homepage, "title", "Title")}
    ${multiInput(siteData.homepage, "slogan", "Slogan", "textarea")}
    ${multiInput(siteData.homepage, "intro", "Intro", "textarea")}
    ${multiInput(siteData.homepage, "about", "About", "textarea")}
    ${uploadLabel("Hero image", "data-home-image")}
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
    ${field("phone", "Phone", siteData.settings.phone || "")}
    ${field("address", "Address", siteData.settings.address || "", "wide")}
    ${field("whatsappMessage", "WhatsApp message", siteData.settings.whatsappMessage || "", "wide")}
    ${field("instagram", "Instagram URL", siteData.settings.instagram || "")}
    ${field("tiktok", "TikTok URL", siteData.settings.tiktok || "")}
    ${field("facebook", "Facebook URL", siteData.settings.facebook || "")}
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
      saveContent("Deleted");
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
        ${options.type ? field("type", "Type", item.type || "") : ""}
        ${options.price ? field("price", "Price", item.price || "") : ""}
        ${multiInput(item, options.title ? "title" : "name", options.title ? "Title" : "Name")}
        ${options.desc ? multiInput(item, "desc", "Description", "textarea") : ""}
        ${options.text ? multiInput(item, "text", "Banner text", "textarea") : ""}
        ${uploadLabel("Upload image", "data-image")}
      </div>
      <div class="editor-actions">
        <button class="btn primary" type="button" data-save>Save</button>
        <button class="btn ghost danger" type="button" data-delete>Delete</button>
      </div>
    </article>
  `;
}

function saveEditor(collection, card) {
  const item = siteData[collection].find((entry) => entry.id === card.dataset.id);
  collectFields(card, item);
  saveContent("Saved");
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
  return `<label class="wide upload-label"><span>${label}</span><small>Drop image here or tap to select. JPG, PNG, WEBP - max 5MB</small><input ${attribute} type="file" accept="${imageAccept}" /></label>`;
}

function categorySelect(item) {
  return `<label><span>Category</span><select data-field="category">${categoryOrder.map((cat) => `<option value="${cat}" ${item.category === cat ? "selected" : ""}>${ui[adminLang].categories[cat]}</option>`).join("")}</select></label>`;
}

function badgeSelect(item) {
  return `<label><span>Badge</span><select data-field="badge">${badgeOptions.map((badge) => `<option value="${badge}" ${item.badge === badge ? "selected" : ""}>${badge || "None"}</option>`).join("")}</select></label>`;
}

async function uploadToField(file, item, fieldName, folder) {
  loading(true);
  try {
    const preview = document.querySelector(`[data-id="${item.id}"] [data-preview]`);
    if (preview) preview.src = await fileToDataUrl(file);
    item[fieldName] = await uploadFirebaseImage(file, folder);
    await saveContent("Image uploaded");
  } catch (error) {
    note(error.message || "Upload failed");
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

getAdminSession().then((session) => {
  if (session) showDashboard(session);
  else showLogin(isFirebaseConfigured() ? "" : "Firebase config is missing. Add the existing Firebase project config before logging in.");
});
