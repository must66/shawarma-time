# Shawarma Time Production Setup

This folder is the production Shawarma Time project.

## 1. Create Supabase Project

1. Open Supabase.
2. Create a new project.
3. Open SQL Editor.
4. Run the full file:

```text
supabase/schema.sql
```

This creates the database tables, RLS policies, admin protection, and public image buckets.

## 2. Get Supabase Environment Values

In Supabase Dashboard:

1. Open Project Settings.
2. Open API.
3. Copy Project URL.
4. Copy anon public key.
5. Copy service_role key.

Use these names in Netlify:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
SUPABASE_MENU_BUCKET=menu-images
SUPABASE_GALLERY_BUCKET=gallery-images
SUPABASE_HERO_BUCKET=hero-images
SUPABASE_OFFERS_BUCKET=offer-banners
SUPABASE_CONTENT_KEY=shawarma-time-site
```

The anon key is safe for the frontend. The service role key is private and must only be stored in Netlify environment variables.

## 3. Create First Admin User

Do not store the admin password in this repository, Netlify variables, HTML, JavaScript, logs, or chat.

1. Open Supabase Dashboard.
2. Go to Authentication > Users.
3. Click Add user.
4. Enter the internal Supabase Auth email and secure password from `ADMIN_CREDENTIALS.md`.
5. Save the user.
6. Copy the created user's UUID.
7. Open `supabase/create-first-admin.sql`.
8. Replace:
   - `00000000-0000-0000-0000-000000000000` with the Auth user UUID.
   - the username value with the private admin username from `ADMIN_CREDENTIALS.md`.
   - the email value with the internal Supabase Auth email from `ADMIN_CREDENTIALS.md`.
   - `Shawarma Time Owner` with the owner name.
9. Run the edited SQL in Supabase SQL Editor.

Only users in `public.admins` with `is_active = true` can access `/admin`.

## 4. Configure Supabase Auth Redirects

In Supabase Dashboard:

1. Open Authentication.
2. Open URL Configuration.
3. Set Site URL to your deployed Netlify site domain.
4. Add redirect URLs:

```text
https://your-netlify-domain/admin/
https://your-netlify-domain/admin/#reset-password
http://127.0.0.1:4173/admin/#reset-password
```

Replace `https://your-netlify-domain` with the real Netlify domain after deployment.

## 5. Connect Netlify

1. Open Netlify.
2. Create a new site from this project/repository.
3. Set build settings:

```text
Build command: npm run build
Publish directory: .
Functions directory: netlify/functions
```

4. Open Site configuration > Environment variables.
5. Add every variable from section 2.
6. Trigger Deploy site.

The included `netlify.toml` handles:

- `/admin` -> `/admin/index.html`
- frontend fallback -> `/index.html`
- Netlify Functions under `/.netlify/functions/*`

## 6. Admin Login Flow

1. Open:

```text
https://your-netlify-domain/admin/
```

2. Enter the admin username.
3. Enter the admin password.
4. After successful login, the admin dashboard opens automatically.
5. The session persists securely through Supabase Auth.
6. Logout clears the session.
7. Password reset uses the `/admin/#reset-password` redirect.

The dashboard saves menu, offers, gallery, banners, homepage content, contact details, opening hours, and design settings through secure Netlify Functions.

## 7. Production Check

After deployment, verify:

1. Homepage loads.
2. `/admin/` shows the secure login page.
3. Admin login redirects to dashboard.
4. Logout returns to login.
5. Menu edits save permanently.
6. Image upload writes to Supabase Storage.
7. Arabic switches to RTL.
8. Dutch and German layouts render correctly.
