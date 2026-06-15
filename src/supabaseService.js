import { defaultSiteData, loadSiteData, saveSiteData, storageKey } from "./data.js";

const CDN = "https://esm.sh/@supabase/supabase-js@2";
let clientPromise;
let configPromise;

export async function getRuntimeConfig() {
  if (!configPromise) {
    configPromise = fetch("/.netlify/functions/config")
      .then((res) => res.ok ? res.json() : {})
      .catch(() => ({}))
      .then((runtimeConfig) => ({
        ...buildConfig(),
        ...(window.SHAWARMA_TIME_CONFIG || {}),
        ...runtimeConfig
      }));
  }
  return configPromise;
}

export async function getSupabase() {
  if (!clientPromise) {
    clientPromise = (async () => {
      const config = await getRuntimeConfig();
      if (!config.supabaseUrl || !config.supabaseAnonKey) return null;
      const { createClient } = await import(/* @vite-ignore */ CDN);
      return createClient(config.supabaseUrl, config.supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true
        }
      });
    })();
  }
  return clientPromise;
}

export async function isSupabaseConfigured() {
  return Boolean(await getSupabase());
}

export async function getSession() {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export async function getCurrentAdmin() {
  const supabase = await getSupabase();
  if (!supabase) return null;
  const session = await getSession();
  if (!session?.user?.id) return null;
  const { data, error } = await supabase
    .from("admins")
    .select("id,user_id,username,email,full_name,role,is_active")
    .eq("user_id", session.user.id)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export async function requireAdminSession() {
  const session = await getSession();
  if (!session) return null;
  const admin = await getCurrentAdmin();
  if (!admin) {
    await signOut();
    return null;
  }
  return { session, admin };
}

export async function signIn(username, password) {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Login service is unavailable. Check the production environment variables.");
  const res = await fetch("/.netlify/functions/auth-username", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "login", username, password })
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Invalid username or password.");
  const { error } = await supabase.auth.setSession({
    access_token: payload.session.access_token,
    refresh_token: payload.session.refresh_token
  });
  if (error) throw error;
  return { session: payload.session, admin: payload.admin };
}

export async function signOut() {
  const supabase = await getSupabase();
  if (supabase) await supabase.auth.signOut();
}

export async function requestPasswordReset(username) {
  if (!(await getSupabase())) throw new Error("Login service is unavailable. Check the production environment variables.");
  const redirectTo = `${window.location.origin}/admin/#reset-password`;
  const res = await fetch("/.netlify/functions/auth-username", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ action: "reset", username, redirectTo })
  });
  const payload = await res.json();
  if (!res.ok) throw new Error(payload.error || "Password reset failed.");
}

export async function updatePassword(newPassword) {
  const supabase = await getSupabase();
  if (!supabase) throw new Error("Login service is unavailable. Check the production environment variables.");
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function loadRemoteSiteData() {
  const supabase = await getSupabase();
  if (!supabase) return loadSiteData();
  const config = await getRuntimeConfig();
  const { data, error } = await supabase
    .from("site_content")
    .select("data")
    .eq("key", config.contentKey || "shawarma-time-site")
    .maybeSingle();
  if (error) throw error;
  if (!data?.data) {
    await saveRemoteSiteData(defaultSiteData);
    return structuredClone(defaultSiteData);
  }
  return mergeSiteData(defaultSiteData, data.data);
}

export async function saveRemoteSiteData(siteData) {
  const supabase = await getSupabase();
  if (!supabase) {
    saveSiteData(siteData);
    return;
  }
  const config = await getRuntimeConfig();
  const payload = {
    key: config.contentKey || "shawarma-time-site",
    data: siteData,
    updated_at: new Date().toISOString()
  };
  const { error } = await supabase.from("site_content").upsert(payload, { onConflict: "key" });
  if (error) throw error;
}

export async function uploadSiteImage(file, bucketType = "menu") {
  const supabase = await getSupabase();
  if (!supabase) return fileToDataUrl(file);
  const config = await getRuntimeConfig();
  const bucket = config.buckets?.[bucketType] || config.mediaBucket || "menu-images";
  const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
  const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "31536000",
      upsert: false,
      contentType: file.type
    });
  if (error) throw error;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data.publicUrl;
}

export function onAuthStateChange(callback) {
  getSupabase().then((supabase) => {
    if (!supabase) return;
    supabase.auth.onAuthStateChange(callback);
  });
}

function fileToDataUrl(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function buildConfig() {
  const env = import.meta.env || {};
  return {
    supabaseUrl: env.VITE_SUPABASE_URL || "",
    supabaseAnonKey: env.VITE_SUPABASE_ANON_KEY || "",
    contentKey: env.VITE_SUPABASE_CONTENT_KEY || "shawarma-time-site"
  };
}

function mergeSiteData(base, stored) {
  return {
    ...structuredClone(base),
    ...stored,
    settings: { ...base.settings, ...stored.settings },
    design: { ...base.design, ...stored.design },
    homepage: { ...base.homepage, ...stored.homepage },
    sectionText: { ...base.sectionText, ...stored.sectionText }
  };
}
