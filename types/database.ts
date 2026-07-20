// OfisNow: Supabase şemasına karşılık gelen alan (domain) tipleri.
// supabase/migrations/20260720000001_init_schema.sql ile birebir uyumludur.

export type UserRole = "employee" | "waiter" | "admin";
export type OrderStatus = "new" | "seen" | "completed" | "cancelled";

export interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  phone: string | null;
  push_token: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Category {
  id: string;
  name: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Product {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
  is_active: boolean;
  created_at: string;
}

export interface Location {
  id: string;
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
  order_number: number;
  employee_id: string;
  status: OrderStatus;
  location_id: string | null;
  custom_location: string | null;
  note: string | null;
  seen_by: string | null;
  seen_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
}

/** Garson ekranı ve sipariş detayı için siparişin ilişkili verilerle birlikte hali. */
export interface OrderWithDetails extends Order {
  order_items: OrderItem[];
  employee: Pick<Profile, "id" | "full_name"> | null;
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
