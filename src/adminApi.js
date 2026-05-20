import { loadSiteData, saveSiteData } from "./data.js";
import { getRuntimeConfig, getSession, getSupabase, isSupabaseConfigured } from "./supabaseService.js";

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function loadAdminSiteData() {
  if (!(await isSupabaseConfigured())) return loadSiteData();
  const res = await authorizedFetch("/.netlify/functions/admin-data");
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Could not load admin data.");
  return payload.data;
}

export async function saveAdminSiteData(data) {
  if (!(await isSupabaseConfigured())) {
    saveSiteData(data);
    return;
  }
  const res = await authorizedFetch("/.netlify/functions/admin-data", {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ data })
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Could not save admin data.");
}

export async function uploadAdminImage(file, bucketType = "menu", previousUrl = "") {
  validateImageFile(file);
  if (!(await isSupabaseConfigured())) return fileToDataUrl(file);
  const bucket = {
    menu: "menu-images",
    gallery: "gallery-images",
    hero: "hero-images",
    offers: "offer-banners"
  }[bucketType] || "menu-images";

  try {
    const res = await authorizedFetch("/.netlify/functions/admin-upload", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        bucket,
        filename: file.name,
        contentType: file.type,
        size: file.size,
        previousUrl,
        base64: await fileToBase64(file)
      })
    });
    const payload = await safeJson(res);
    if (!res.ok) throw new Error(payload.error || "Upload failed.");
    if (!payload.publicUrl) throw new Error("Upload function unavailable.");
    return payload.publicUrl;
  } catch (error) {
    if (!shouldUseDirectStorageFallback(error)) throw error;
    return uploadDirectToSupabase(file, bucket, previousUrl);
  }
}

async function authorizedFetch(url, options = {}) {
  const session = await getSession();
  if (!session?.access_token) throw new Error("Not authenticated.");
  return fetch(url, {
    ...options,
    headers: {
      ...(options.headers || {}),
      authorization: `Bearer ${session.access_token}`
    }
  });
}

async function safeJson(res) {
  try {
    return await res.json();
  } catch {
    return {};
  }
}

function validateImageFile(file) {
  if (!file) throw new Error("No image selected.");
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error("Only JPG, PNG and WEBP images are allowed.");
  }
  if (file.size > MAX_IMAGE_SIZE) {
    throw new Error("Image is too large. Maximum size is 5MB.");
  }
}

function shouldUseDirectStorageFallback(error) {
  return /Unexpected token|Failed to fetch|NetworkError|Load failed|not found|404|unavailable/i.test(String(error?.message || error));
}

async function uploadDirectToSupabase(file, bucket, previousUrl = "") {
  const supabase = await getSupabase();
  const session = await getSession();
  if (!supabase || !session?.access_token) throw new Error("Not authenticated.");
  const config = await getRuntimeConfig();
  const projectUrl = config.supabaseUrl || "";
  const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
  const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage.from(bucket).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
    contentType: file.type
  });
  if (error) throw error;
  await removePreviousImage(supabase, bucket, previousUrl, projectUrl);
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

async function removePreviousImage(supabase, bucket, previousUrl, projectUrl) {
  const path = storagePathFromPublicUrl(previousUrl, bucket, projectUrl);
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]).catch(() => {});
}

function storagePathFromPublicUrl(url, bucket, projectUrl) {
  if (!url || url.startsWith("data:") || !projectUrl || !url.includes(projectUrl)) return "";
  const marker = `/storage/v1/object/public/${bucket}/`;
  const index = url.indexOf(marker);
  if (index === -1) return "";
  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(String(reader.result).split(",")[1]);
    reader.readAsDataURL(file);
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}
