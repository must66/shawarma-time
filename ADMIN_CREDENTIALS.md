# Shawarma Time Private Admin Credentials

This file is private operational material. Do not publish it publicly, paste it into chat unless explicitly needed, commit it to a public repository, or expose it in frontend code.

## Generated First Admin Login

```text
Admin username: admin
Admin password: Shawarma2026!
Internal Supabase Auth email: admin@shawarma-time.local
```

The public admin login form uses username and password only. The internal email is used only because Supabase Auth requires an email identity behind the scenes.

## Automated Supabase Setup Command

Run this from the project root after installing dependencies and adding the Supabase service role key:

```powershell
$env:VITE_SUPABASE_URL="https://your-project-ref.supabase.co"
$env:SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
$env:ADMIN_USERNAME="admin"
$env:ADMIN_PASSWORD="Shawarma2026!"
npm run admin:create
```

The script creates the Supabase Auth user, confirms the internal email, and inserts/updates the owner row in `public.admins`.

## Manual Supabase Dashboard Setup

1. Open Supabase Dashboard.
2. Go to Authentication > Users.
3. Click Add user.
4. Use the internal Supabase Auth email and password above.
5. Mark the email as confirmed if Supabase asks.
6. Copy the new user's UUID.
7. Run this SQL in Supabase SQL Editor:

```sql
insert into public.admins (user_id, username, email, full_name, role, is_active)
values (
  'AUTH_USER_UUID',
  'admin',
  'admin@shawarma-time.local',
  'Shawarma Time Owner',
  'owner',
  true
)
on conflict (user_id) do update set
  username = excluded.username,
  email = excluded.email,
  full_name = excluded.full_name,
  role = excluded.role,
  is_active = true,
  updated_at = now();
```

## Login

1. Open `/admin/`.
2. Enter username `admin`.
3. Enter the generated password above.
4. Successful Supabase Auth login redirects automatically to the dashboard.

Only authenticated users listed in `public.admins` with `is_active = true` can access the dashboard.
