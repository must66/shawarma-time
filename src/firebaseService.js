import { defaultSiteData, loadSiteData, saveSiteData } from "./data.js";
import { firebaseConfig, firebaseEnabled } from "./firebaseConfig.js";

const APP_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
const AUTH_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
const FIRESTORE_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
const STORAGE_URL = "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

const CONTENT_COLLECTION = "siteContent";
const CONTENT_DOC = "shawarmaTime";
const ADMIN_COLLECTION = "admins";
const DEFAULT_USERNAME = "admin";
const DEFAULT_EMAIL = "admin@shawarma-time.local";
const DEFAULT_PASSWORD = "Shawarma2026!";
const MAX_IMAGE_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

let firebasePromise;

export function isFirebaseConfigured() {
  return firebaseEnabled;
}

export function usernameToEmail(username) {
  const value = String(username || "").trim().toLowerCase();
  if (value === DEFAULT_USERNAME) return DEFAULT_EMAIL;
  return `${value}@shawarma-time.local`;
}

export async function getFirebase() {
  if (!firebaseEnabled) return null;
  if (!firebasePromise) {
    firebasePromise = (async () => {
      const [{ initializeApp }, authMod, firestoreMod, storageMod] = await Promise.all([
        import(APP_URL),
        import(AUTH_URL),
        import(FIRESTORE_URL),
        import(STORAGE_URL)
      ]);
      const app = initializeApp(firebaseConfig);
      return {
        app,
        auth: authMod.getAuth(app),
        db: firestoreMod.getFirestore(app),
        storage: storageMod.getStorage(app),
        authMod,
        firestoreMod,
        storageMod
      };
    })();
  }
  return firebasePromise;
}

export async function signInAdmin(username, password) {
  const firebase = await getFirebase();
  if (!firebase) {
    if (String(username).trim().toLowerCase() === DEFAULT_USERNAME && password === DEFAULT_PASSWORD) {
      sessionStorage.setItem("shawarma-time-admin-local", "true");
      return { local: true, username: DEFAULT_USERNAME, role: "owner" };
    }
    throw new Error("Firebase is not configured.");
  }

  const email = usernameToEmail(username);
  try {
    const credential = await firebase.authMod.signInWithEmailAndPassword(firebase.auth, email, password);
    await ensureAdminDoc(credential.user.uid, username, email);
    return credential.user;
  } catch (error) {
    if (String(username).trim().toLowerCase() === DEFAULT_USERNAME && password === DEFAULT_PASSWORD && error.code === "auth/user-not-found") {
      const credential = await firebase.authMod.createUserWithEmailAndPassword(firebase.auth, DEFAULT_EMAIL, DEFAULT_PASSWORD);
      await ensureAdminDoc(credential.user.uid, DEFAULT_USERNAME, DEFAULT_EMAIL);
      await ensureInitialContent();
      return credential.user;
    }
    throw error;
  }
}

export async function signOutAdmin() {
  sessionStorage.removeItem("shawarma-time-admin-local");
  const firebase = await getFirebase();
  if (firebase) await firebase.authMod.signOut(firebase.auth);
}

export async function getAdminSession() {
  if (sessionStorage.getItem("shawarma-time-admin-local") === "true") {
    return { local: true, username: DEFAULT_USERNAME, role: "owner" };
  }
  const firebase = await getFirebase();
  if (!firebase) return null;
  await firebase.auth.authStateReady?.();
  const user = firebase.auth.currentUser;
  if (!user) return null;
  const admin = await getAdminDoc(user.uid);
  if (!admin?.active) {
    await firebase.authMod.signOut(firebase.auth);
    return null;
  }
  return { user, admin };
}

export async function onAdminAuthChange(callback) {
  const firebase = await getFirebase();
  if (!firebase) return () => {};
  return firebase.authMod.onAuthStateChanged(firebase.auth, callback);
}

export async function loadFirebaseSiteData() {
  const firebase = await getFirebase();
  if (!firebase) return loadSiteData();
  const ref = contentRef(firebase);
  const snap = await firebase.firestoreMod.getDoc(ref);
  if (!snap.exists()) {
    return structuredClone(defaultSiteData);
  }
  return mergeSiteData(defaultSiteData, snap.data().data || {});
}

export async function saveFirebaseSiteData(siteData) {
  const firebase = await getFirebase();
  if (!firebase) {
    saveSiteData(siteData);
    return;
  }
  await firebase.firestoreMod.setDoc(contentRef(firebase), {
    data: siteData,
    updatedAt: firebase.firestoreMod.serverTimestamp()
  }, { merge: true });
}

export async function subscribeFirebaseSiteData(callback) {
  const firebase = await getFirebase();
  if (!firebase) return () => {};
  return firebase.firestoreMod.onSnapshot(contentRef(firebase), (snap) => {
    if (snap.exists()) callback(mergeSiteData(defaultSiteData, snap.data().data || {}));
  });
}

export async function uploadFirebaseImage(file, folder = "menu") {
  validateImage(file);
  const firebase = await getFirebase();
  if (!firebase) return fileToDataUrl(file);
  const safeName = file.name.replace(/[^a-z0-9._-]+/gi, "-").toLowerCase();
  const path = `${folder}/${Date.now()}-${crypto.randomUUID()}-${safeName}`;
  const ref = firebase.storageMod.ref(firebase.storage, path);
  await firebase.storageMod.uploadBytes(ref, file, {
    contentType: file.type,
    cacheControl: "public,max-age=31536000"
  });
  return firebase.storageMod.getDownloadURL(ref);
}

async function ensureAdminDoc(uid, username, email) {
  const firebase = await getFirebase();
  const ref = firebase.firestoreMod.doc(firebase.db, ADMIN_COLLECTION, uid);
  const snap = await firebase.firestoreMod.getDoc(ref);
  if (snap.exists()) return;
  await firebase.firestoreMod.setDoc(ref, {
    username: String(username).trim().toLowerCase(),
    email,
    role: "owner",
    active: true,
    createdAt: firebase.firestoreMod.serverTimestamp()
  });
}

async function getAdminDoc(uid) {
  const firebase = await getFirebase();
  const snap = await firebase.firestoreMod.getDoc(firebase.firestoreMod.doc(firebase.db, ADMIN_COLLECTION, uid));
  return snap.exists() ? snap.data() : null;
}

async function ensureInitialContent() {
  const firebase = await getFirebase();
  const ref = contentRef(firebase);
  const snap = await firebase.firestoreMod.getDoc(ref);
  if (!snap.exists()) await saveFirebaseSiteData(defaultSiteData);
}

function contentRef(firebase) {
  return firebase.firestoreMod.doc(firebase.db, CONTENT_COLLECTION, CONTENT_DOC);
}

function validateImage(file) {
  if (!file) throw new Error("No image selected.");
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) throw new Error("Only JPG, PNG and WEBP images are allowed.");
  if (file.size > MAX_IMAGE_SIZE) throw new Error("Image is too large. Maximum size is 5MB.");
}

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(reader.error);
    reader.onload = () => resolve(reader.result);
    reader.readAsDataURL(file);
  });
}

function mergeSiteData(base, stored) {
  const merged = { ...structuredClone(base), ...stored };
  merged.settings = { ...base.settings, ...stored.settings };
  merged.design = { ...base.design, ...stored.design };
  merged.homepage = { ...base.homepage, ...stored.homepage };
  merged.sectionText = { ...base.sectionText, ...stored.sectionText };
  return merged;
}
