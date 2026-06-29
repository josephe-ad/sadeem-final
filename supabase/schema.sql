-- ============================================================
-- SADEEM — Supabase Schema (tables, RLS, storage, triggers)
-- Run this in Supabase SQL Editor (Project > SQL Editor > New query)
-- ============================================================

create extension if not exists "uuid-ossp";

-- ============================================================
-- ENUM TYPES
-- ============================================================
create type admin_role as enum ('super_admin', 'admin', 'editor');
create type order_status as enum ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');

-- ============================================================
-- CATEGORIES
-- ============================================================
create table categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  slug text not null unique,
  description text,
  image_url text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- PRODUCTS
-- ============================================================
create table products (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text,
  price numeric(10,2) not null check (price >= 0),
  discount_price numeric(10,2) check (discount_price >= 0),
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  sku text unique,
  category_id uuid references categories(id) on delete set null,
  is_featured boolean default false,
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_products_category on products(category_id);
create index idx_products_active on products(is_active);
create index idx_products_featured on products(is_featured);
create index idx_products_slug on products(slug);

-- ============================================================
-- PRODUCT IMAGES
-- ============================================================
create table product_images (
  id uuid primary key default uuid_generate_v4(),
  product_id uuid not null references products(id) on delete cascade,
  image_url text not null,
  storage_path text not null,
  sort_order int default 0,
  is_primary boolean default false,
  created_at timestamptz default now()
);

create index idx_product_images_product on product_images(product_id);

-- ============================================================
-- ORDERS
-- ============================================================
create table orders (
  id uuid primary key default uuid_generate_v4(),
  order_number text not null unique,
  customer_name text not null,
  phone_number text not null,
  address text not null,
  city text not null,
  notes text,
  status order_status not null default 'pending',
  subtotal numeric(10,2) not null default 0,
  shipping_price numeric(10,2) not null default 0,
  total numeric(10,2) not null default 0,
  currency text not null default 'SAR',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_orders_status on orders(status);
create index idx_orders_created on orders(created_at desc);

-- ============================================================
-- ORDER ITEMS
-- ============================================================
create table order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references orders(id) on delete cascade,
  product_id uuid references products(id) on delete set null,
  product_title text not null,
  unit_price numeric(10,2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10,2) not null,
  created_at timestamptz default now()
);

create index idx_order_items_order on order_items(order_id);

-- ============================================================
-- ADMIN USERS (mirrors auth.users, adds role)
-- ============================================================
create table admin_users (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text not null,
  role admin_role not null default 'editor',
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- ============================================================
-- SITE SETTINGS (singleton-style key/value, one row per setting group)
-- ============================================================
create table site_settings (
  id uuid primary key default uuid_generate_v4(),
  logo_url text,
  hero_title text default 'SADEEM',
  hero_subtitle text default 'Born from the stars.',
  whatsapp_number text,
  shipping_price numeric(10,2) default 0,
  currency text default 'SAR',
  social_instagram text,
  social_tiktok text,
  social_twitter text,
  social_snapchat text,
  seo_title text,
  seo_description text,
  seo_keywords text,
  updated_at timestamptz default now()
);

-- ============================================================
-- HERO SECTIONS (homepage cinematic slides)
-- ============================================================
create table hero_sections (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  subtitle text,
  media_url text,
  media_type text default 'image', -- image | video
  cta_label text,
  cta_link text,
  sort_order int default 0,
  is_active boolean default true,
  created_at timestamptz default now()
);

-- ============================================================
-- TESTIMONIALS
-- ============================================================
create table testimonials (
  id uuid primary key default uuid_generate_v4(),
  customer_name text not null,
  content text not null,
  rating int check (rating between 1 and 5) default 5,
  avatar_url text,
  is_active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

-- ============================================================
-- ANALYTICS EVENTS
-- ============================================================
create table analytics_events (
  id uuid primary key default uuid_generate_v4(),
  event_type text not null, -- page_view | product_view | add_to_cart | order_placed
  product_id uuid references products(id) on delete set null,
  order_id uuid references orders(id) on delete set null,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index idx_analytics_type on analytics_events(event_type);
create index idx_analytics_created on analytics_events(created_at desc);

-- ============================================================
-- updated_at trigger helper
-- ============================================================
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_products_updated before update on products
  for each row execute function set_updated_at();
create trigger trg_categories_updated before update on categories
  for each row execute function set_updated_at();
create trigger trg_orders_updated before update on orders
  for each row execute function set_updated_at();
create trigger trg_admin_users_updated before update on admin_users
  for each row execute function set_updated_at();
create trigger trg_site_settings_updated before update on site_settings
  for each row execute function set_updated_at();

-- ============================================================
-- Helper: is current user an admin?
-- ============================================================
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid() and is_active = true
  );
$$ language sql security definer stable;

create or replace function is_super_admin()
returns boolean as $$
  select exists (
    select 1 from admin_users
    where id = auth.uid() and role = 'super_admin' and is_active = true
  );
$$ language sql security definer stable;

-- ============================================================
-- ROW LEVEL SECURITY
-- ============================================================
alter table products enable row level security;
alter table categories enable row level security;
alter table product_images enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;
alter table admin_users enable row level security;
alter table site_settings enable row level security;
alter table hero_sections enable row level security;
alter table testimonials enable row level security;
alter table analytics_events enable row level security;

-- Public read access for storefront (active records only)
create policy "Public read active products" on products
  for select using (is_active = true or is_admin());

create policy "Public read active categories" on categories
  for select using (is_active = true or is_admin());

create policy "Public read product images" on product_images
  for select using (true);

create policy "Public read active hero sections" on hero_sections
  for select using (is_active = true or is_admin());

create policy "Public read active testimonials" on testimonials
  for select using (is_active = true or is_admin());

create policy "Public read site settings" on site_settings
  for select using (true);

-- Admin full write access
create policy "Admins manage products" on products
  for all using (is_admin()) with check (is_admin());

create policy "Admins manage categories" on categories
  for all using (is_admin()) with check (is_admin());

create policy "Admins manage product images" on product_images
  for all using (is_admin()) with check (is_admin());

create policy "Admins manage hero sections" on hero_sections
  for all using (is_admin()) with check (is_admin());

create policy "Admins manage testimonials" on testimonials
  for all using (is_admin()) with check (is_admin());

create policy "Admins manage site settings" on site_settings
  for all using (is_admin()) with check (is_admin());

-- Orders: anyone can INSERT (guest checkout), only admins can read/update/delete
create policy "Anyone can place an order" on orders
  for insert with check (true);

create policy "Admins read orders" on orders
  for select using (is_admin());

create policy "Admins update orders" on orders
  for update using (is_admin()) with check (is_admin());

create policy "Admins delete orders" on orders
  for delete using (is_admin());

create policy "Anyone can insert order items" on order_items
  for insert with check (true);

create policy "Admins read order items" on order_items
  for select using (is_admin());

create policy "Admins manage order items" on order_items
  for all using (is_admin()) with check (is_admin());

-- admin_users: only super_admin manages; users can read own row
create policy "Admins read own row" on admin_users
  for select using (id = auth.uid() or is_super_admin());

create policy "Super admin manages admin users" on admin_users
  for all using (is_super_admin()) with check (is_super_admin());

-- analytics: anyone can insert (tracking), only admins read
create policy "Anyone can log analytics" on analytics_events
  for insert with check (true);

create policy "Admins read analytics" on analytics_events
  for select using (is_admin());

-- ============================================================
-- STORAGE BUCKETS
-- ============================================================
insert into storage.buckets (id, name, public)
values
  ('product-images', 'product-images', true),
  ('brand-assets', 'brand-assets', true),
  ('hero-media', 'hero-media', true),
  ('category-images', 'category-images', true)
on conflict (id) do nothing;

-- Public read for all 4 buckets
create policy "Public read product-images" on storage.objects
  for select using (bucket_id = 'product-images');
create policy "Public read brand-assets" on storage.objects
  for select using (bucket_id = 'brand-assets');
create policy "Public read hero-media" on storage.objects
  for select using (bucket_id = 'hero-media');
create policy "Public read category-images" on storage.objects
  for select using (bucket_id = 'category-images');

-- Admin-only write/delete across all 4 buckets
create policy "Admins upload product-images" on storage.objects
  for insert with check (bucket_id = 'product-images' and is_admin());
create policy "Admins update product-images" on storage.objects
  for update using (bucket_id = 'product-images' and is_admin());
create policy "Admins delete product-images" on storage.objects
  for delete using (bucket_id = 'product-images' and is_admin());

create policy "Admins upload brand-assets" on storage.objects
  for insert with check (bucket_id = 'brand-assets' and is_admin());
create policy "Admins update brand-assets" on storage.objects
  for update using (bucket_id = 'brand-assets' and is_admin());
create policy "Admins delete brand-assets" on storage.objects
  for delete using (bucket_id = 'brand-assets' and is_admin());

create policy "Admins upload hero-media" on storage.objects
  for insert with check (bucket_id = 'hero-media' and is_admin());
create policy "Admins update hero-media" on storage.objects
  for update using (bucket_id = 'hero-media' and is_admin());
create policy "Admins delete hero-media" on storage.objects
  for delete using (bucket_id = 'hero-media' and is_admin());

create policy "Admins upload category-images" on storage.objects
  for insert with check (bucket_id = 'category-images' and is_admin());
create policy "Admins update category-images" on storage.objects
  for update using (bucket_id = 'category-images' and is_admin());
create policy "Admins delete category-images" on storage.objects
  for delete using (bucket_id = 'category-images' and is_admin());

-- ============================================================
-- SEED: default site_settings row + categories
-- ============================================================
insert into site_settings (hero_title, hero_subtitle, currency, shipping_price)
values ('SADEEM', 'Born from the stars. Crafted for elegance.', 'SAR', 25)
on conflict do nothing;

insert into categories (name, slug, description, sort_order) values
  ('Luxury Abayas', 'luxury-abayas', 'Timeless silhouettes, celestial elegance.', 1),
  ('Premium Perfumes', 'premium-perfumes', 'Scents inspired by nebulae and starlight.', 2),
  ('Future Luxury Collections', 'future-collections', 'What comes next, before it arrives.', 3)
on conflict (slug) do nothing;
