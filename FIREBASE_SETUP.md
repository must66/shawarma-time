# Shawarma Time Firebase Admin Setup

The website is ready for GitHub Pages with a real `/admin/` route.

## Firebase Services

Enable these Firebase products:

- Authentication: Email/password provider
- Firestore Database
- Storage

## Configure The Website

Open:

```text
src/firebaseConfig.js
```

Paste your Firebase web app config:

```js
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
```

Firebase config is public by design. Do not put service account keys in this website.

## Default Admin Login

Admin URL:

```text
https://must66.github.io/shawarma-time/admin/
```

Default username:

```text
admin
```

Default password:

```text
Shawarma2026!
```

The admin page maps username `admin` to the internal Firebase Auth email:

```text
admin@shawarma-time.local
```

If that user does not exist yet, the admin page creates it the first time the default username/password are used.

## Firestore Rules

Use the included `firestore.rules` as the base rules. They allow public reads of site content and restrict writes to authenticated active admins.

## Storage Rules

Use the included `storage.rules`. They allow public image reads and restrict uploads to authenticated active admins.
