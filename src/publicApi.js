import { categoryOrder, defaultSiteData, localized, normalizeCategoryOrder, normalizeCategorySlug, normalizeSiteDataCategories } from "./data.js";
import { isFirebaseConfigured, loadFirebaseSiteData, subscribeFirebaseSiteData } from "./firebaseService.js?v=20260616-platform-stable";
import { getSupabase } from "./supabaseService.js";

export async function fetchPublicSiteData() {
  if (isFirebaseConfigured()) return loadFirebaseSiteData();
  const supabase = await getSupabase();
  if (!supabase) return normalizeSiteDataCategories(defaultSiteData);

  const [
    categories,
    menuItems,
    offers,
    gallery,
    homepage,
    openingHours,
    contact,
    banners
  ] = await Promise.all([
    query(supabase.from("menu_categories").select("*").eq("is_active", true).order("sort_order")),
    query(supabase.from("menu_items").select("*, menu_categories(slug)").eq("is_active", true).order("sort_order")),
    query(supabase.from("offers").select("*").eq("is_active", true).order("sort_order")),
    query(supabase.from("gallery_images").select("*").eq("is_active", true).order("sort_order")),
    query(supabase.from("homepage_settings").select("*").eq("is_active", true).order("sort_order").limit(1)),
    query(supabase.from("opening_hours").select("*").eq("is_active", true).order("sort_order")),
    query(supabase.from("contact_information").select("*").eq("is_active", true).order("sort_order").limit(1)),
    query(supabase.from("hero_banners").select("*").eq("is_active", true).order("sort_order"))
  ]);

  return normalizePublicData({
    categories,
    menuItems,
    offers,
    gallery,
    homepage: homepage[0],
    openingHours,
    contact: contact[0],
    banners
  });
}

export async function subscribeToPublicUpdates(onChange) {
  if (isFirebaseConfigured()) {
    return subscribeFirebaseSiteData((data) => onChange(data));
  }
  const supabase = await getSupabase();
  if (!supabase) return () => {};
  const tables = [
    "menu_categories",
    "menu_items",
    "offers",
    "gallery_images",
    "homepage_settings",
    "opening_hours",
    "contact_information",
    "hero_banners"
  ];
  const channel = supabase.channel("public-site-content");
  tables.forEach((table) => {
    channel.on("postgres_changes", { event: "*", schema: "public", table }, onChange);
  });
  channel.subscribe();
  return () => supabase.removeChannel(channel);
}

async function query(builder) {
  const { data, error } = await builder;
  if (error) throw error;
  return data || [];
}

function normalizePublicData(rows) {
  const fallback = structuredClone(defaultSiteData);
  const categoriesById = new Map();
  const categorySlugs = [];

  rows.categories.forEach((category) => {
    categoriesById.set(category.id, category.slug);
    categorySlugs.push(category.slug);
  });

  const homepage = rows.homepage;
  const contact = rows.contact;

  return normalizeSiteDataCategories({
    ...fallback,
    homepage: homepage ? {
      ...fallback.homepage,
      title: multilingual(homepage, "title"),
      slogan: multilingual(homepage, "slogan"),
      intro: multilingual(homepage, "intro"),
      about: multilingual(homepage, "about"),
      heroImage: homepage.hero_image_url || homepage.background_image_url || fallback.homepage.heroImage
    } : fallback.homepage,
    sectionText: homepage ? {
      ...fallback.sectionText,
      footer: multilingual(homepage, "footer_text")
    } : fallback.sectionText,
    design: homepage ? {
      ...fallback.design,
      logoImage: homepage.logo_url || fallback.design.logoImage,
      accentColor: homepage.primary_color || fallback.design.accentColor,
      goldColor: homepage.secondary_color || fallback.design.goldColor,
      tone: homepage.background_tone || fallback.design.tone,
      animations: homepage.animations_enabled
    } : fallback.design,
    settings: contact ? {
      ...fallback.settings,
      phone: contact.phone || fallback.settings.phone,
      address: contact.address_nl || fallback.settings.address,
      instagram: contact.instagram_url || fallback.settings.instagram,
      tiktok: contact.tiktok_url || fallback.settings.tiktok,
      facebook: contact.facebook_url || fallback.settings.facebook,
      whatsappMessage: contact.whatsapp_message_nl || fallback.settings.whatsappMessage,
      hours: rows.openingHours.length ? rows.openingHours.map(formatHour) : fallback.settings.hours
    } : {
      ...fallback.settings,
      hours: rows.openingHours.length ? rows.openingHours.map(formatHour) : fallback.settings.hours
    },
    banners: rows.banners.length ? rows.banners.map((banner) => ({
      id: banner.id,
      title: multilingual(banner, "title"),
      text: multilingual(banner, "subtitle"),
      image: banner.image_url || banner.video_url || fallback.homepage.heroImage
    })) : fallback.banners,
    menu: rows.menuItems.length ? rows.menuItems.map((item) => ({
      id: item.id,
      category: normalizeCategorySlug(item.menu_categories?.slug || categoriesById.get(item.category_id) || categoryOrder[0]),
      price: formatPrice(item.price, item.currency),
      badge: item.badge || "",
      name: multilingual(item, "name"),
      desc: multilingual(item, "description"),
      image: item.image_url || fallback.homepage.heroImage
    })) : fallback.menu,
    offers: rows.offers.length ? rows.offers.map((offer) => ({
      id: offer.id,
      type: offer.offer_type || "daily",
      price: formatPrice(offer.price, offer.currency),
      name: multilingual(offer, "title"),
      desc: multilingual(offer, "description"),
      image: offer.image_url || fallback.homepage.heroImage
    })) : fallback.offers,
    gallery: rows.gallery.length ? rows.gallery.map((image) => ({
      id: image.id,
      type: image.image_type || "food",
      title: multilingual(image, "title"),
      image: image.image_url
    })) : fallback.gallery,
    categoryOrder: normalizeCategoryOrder(categorySlugs)
  });
}

function multilingual(row, prefix) {
  return {
    ar: row[`${prefix}_ar`] || "",
    nl: row[`${prefix}_nl`] || "",
    de: row[`${prefix}_de`] || "",
    en: row[`${prefix}_en`] || row[`${prefix}_nl`] || ""
  };
}

function formatHour(row) {
  if (row.is_closed) return localized({ ar: row.display_text_ar, nl: row.display_text_nl, de: row.display_text_de }, "nl") || "Gesloten";
  if (row.display_text_nl) return row.display_text_nl;
  if (!row.opens_at || !row.closes_at) return "";
  return `${row.opens_at.slice(0, 5)} - ${row.closes_at.slice(0, 5)}`;
}

function formatPrice(price, currency = "EUR") {
  if (price === null || price === undefined) return "";
  const symbol = currency === "EUR" ? "€" : `${currency} `;
  return `${symbol}${Number(price).toFixed(2).replace(".", ",")}`;
}
