// Generates public/sitemap.xml from live Supabase data.
// Run with: node scripts/generate-sitemap.mjs
// Requires VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in env.
import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const SITE_URL = process.env.SITE_URL || 'https://your-domain.com';
const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

const { data: products } = await supabase.from('products').select('slug, updated_at').eq('is_active', true);
const { data: categories } = await supabase.from('categories').select('slug').eq('is_active', true);

const staticUrls = ['', '/shop'];
const urls = [
  ...staticUrls.map((u) => `${SITE_URL}${u}`),
  ...(categories ?? []).map((c) => `${SITE_URL}/shop/${c.slug}`),
  ...(products ?? []).map((p) => `${SITE_URL}/product/${p.slug}`),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>`;

writeFileSync('public/sitemap.xml', xml);
console.log(`Sitemap generated with ${urls.length} URLs.`);
