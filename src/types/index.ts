export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
export type AdminRole = 'super_admin' | 'admin' | 'editor';

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  storage_path: string;
  sort_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  price: number;
  discount_price: number | null;
  stock_quantity: number;
  sku: string | null;
  category_id: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  category?: Category;
  product_images?: ProductImage[];
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_title: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  created_at: string;
}

export interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  phone_number: string;
  address: string;
  city: string;
  notes: string | null;
  status: OrderStatus;
  subtotal: number;
  shipping_price: number;
  total: number;
  currency: string;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface AdminUser {
  id: string;
  full_name: string | null;
  email: string;
  role: AdminRole;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface SiteSettings {
  id: string;
  logo_url: string | null;
  hero_title: string | null;
  hero_subtitle: string | null;
  whatsapp_number: string | null;
  shipping_price: number;
  currency: string;
  social_instagram: string | null;
  social_tiktok: string | null;
  social_twitter: string | null;
  social_snapchat: string | null;
  seo_title: string | null;
  seo_description: string | null;
  seo_keywords: string | null;
  updated_at: string;
}

export interface HeroSection {
  id: string;
  title: string;
  subtitle: string | null;
  media_url: string | null;
  media_type: 'image' | 'video';
  cta_label: string | null;
  cta_link: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Testimonial {
  id: string;
  customer_name: string;
  content: string;
  rating: number;
  avatar_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}
