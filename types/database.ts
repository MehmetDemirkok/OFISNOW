// OfisNow: Supabase şemasına karşılık gelen alan (domain) tipleri.
// supabase/migrations/20260720000001_init_schema.sql ile birebir uyumludur.

export type UserRole = "employee" | "waiter";
export type OrderStatus = "new" | "seen" | "completed" | "cancelled";
export type OrderType = "product" | "call" | "pickup";

export interface Company {
  id: string;
  name: string;
  invite_code: string;
  invite_code_generated_at: string;
  created_at: string;
}

export interface Profile {
  id: string;
  company_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  push_token: string | null;
  is_active: boolean;
  location_description: string | null;
  avatar_url: string | null;
  birth_date: string | null;
  job_title: string | null;
  created_at: string;
}

export interface Category {
  id: string;
  company_id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  company_id: string;
  category_id: string;
  name: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

/** Yalnızca geçmiş siparişlerin eski paylaşılan konum kaydını göstermek için tutulur. */
export interface Location {
  id: string;
  company_id: string;
  name: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  special_request: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  company_id: string;
  order_number: number;
  employee_id: string;
  status: OrderStatus;
  order_type: OrderType;
  location_id: string | null;
  custom_location: string | null;
  note: string | null;
  seen_by: string | null;
  seen_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Görevli ekranı ve sipariş detayı için siparişin ilişkili verilerle birlikte hali. */
export interface OrderWithDetails extends Order {
  order_items: OrderItem[];
  employee: Pick<Profile, "id" | "full_name" | "job_title"> | null;
  location: Pick<Location, "id" | "name"> | null;
  seen_by_profile: Pick<Profile, "id" | "full_name"> | null;
}

/** Sepetteki bir kalem — create_order RPC'sine gönderilecek biçim. */
export interface CartItemInput {
  product_id: string;
  product_name: string;
  quantity: number;
  special_request: string | null;
}
