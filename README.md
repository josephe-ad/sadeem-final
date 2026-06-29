# SADEEM — Luxury E-Commerce Platform

Inspired by nebulae and starlight. Built fully dynamic on Supabase + React/Vite, deployable to Vercel.

## 1. Supabase Setup

1. Create a project at supabase.com.
2. Open **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it.
   - This creates all tables, RLS policies, storage buckets, and seeds default categories + settings.
3. Create your first admin user:
   - **Authentication → Users → Add user** (email + password).
   - Then in SQL Editor run:
     ```sql
     insert into admin_users (id, email, full_name, role)
     values ('<the-user-uuid-from-auth>', 'you@example.com', 'Your Name', 'super_admin');
     ```
4. Copy your Project URL and anon key from **Settings → API**.

## 2. Local Setup

```bash
npm install
cp .env.example .env
# fill in VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
npm run dev
```

Storefront: `http://localhost:5173`
Admin dashboard: `http://localhost:5173/admin/login`

## 3. Deploy to Vercel

1. Push this repo to GitHub.
2. Import it in Vercel.
3. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel project settings.
4. Deploy. `vercel.json` already handles SPA rewrites so client-side routing works on refresh/deep links.

## 4. How "fully dynamic" works

- **Products/Categories**: stored in Postgres, fetched live, and kept in sync on the storefront via Supabase Realtime subscriptions (`useProducts`, `useCategories`). Add/edit/delete in `/admin/products` and the storefront updates without a rebuild.
- **Images**: uploaded directly to Supabase Storage buckets (`product-images`, `brand-assets`, `hero-media`, `category-images`) from the admin UI; public URLs are generated automatically and deleting a product also removes its storage objects.
- **Site settings** (hero text, logo, WhatsApp, shipping price, currency, SEO): one row in `site_settings`, editable from `/admin/settings`, live-synced to the storefront via Realtime.
- **Orders**: guest checkout writes directly to `orders` + `order_items`; RLS allows public `INSERT` but restricts `SELECT`/`UPDATE` to admins.

## 5. Security

- Row Level Security is enabled on every table. Public roles can only read active/published rows and insert orders; all writes require an `admin_users` row with `is_active = true`.
- Role-based access (`super_admin`, `admin`, `editor`) is enforced via the `is_admin()` / `is_super_admin()` SQL functions used inside RLS policies — not just in the frontend.
- Forms use Zod schema validation (client) and Postgres constraints (server) to block bad input.

## 6. SEO

- `public/robots.txt` is included.
- `scripts/generate-sitemap.mjs` builds `public/sitemap.xml` from live Supabase data — run it as a pre-build step (`node scripts/generate-sitemap.mjs`) whenever you want it refreshed, or wire it into a CI job/cron.
- Add Open Graph/meta tag values via `site_settings.seo_title` / `seo_description` — wire these into `<head>` with a small head-management hook if you want per-page tags (a good next addition).

## 7. What's included vs. what to extend next

**Included and working:**
Full schema + RLS + storage buckets, storefront (home, shop with category filter, product detail, cart, checkout, order confirmation), admin auth + protected routes, admin dashboard, full product CRUD with multi-image upload, categories CRUD, orders management (search/filter/status/print), site settings, admin user role management, 404/invalid-route handling, sitemap/robots.

**Recommended next steps** (not yet built, by design, to keep this reviewable):
- Per-page dynamic `<head>` meta tags / structured data (JSON-LD) wired to `site_settings`.
- Hero sections / testimonials admin CRUD UI (tables exist; reuse the categories admin pattern).
- Analytics dashboard charts reading from `analytics_events`.
- Image optimization pipeline (e.g. Supabase image transforms or a CDN) once you have real product photos.
