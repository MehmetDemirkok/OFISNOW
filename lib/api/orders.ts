import { supabase } from "@/lib/supabase";
import type { CartItemInput, Order, OrderWithDetails } from "@/types/database";

const ORDER_DETAIL_SELECT = `*,
  order_items(*),
  employee:profiles!orders_employee_id_fkey(id, full_name),
  location:locations(id, name),
  seen_by_profile:profiles!orders_seen_by_fkey(id, full_name)`;

/** PostgREST bire-bir ilişkileri bazen dizi olarak döndürebilir; her iki biçimi de normalize eder. */
function normalizeOne<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) return (value[0] as T) ?? null;
  return (value as T) ?? null;
}

function normalizeOrder(raw: any): OrderWithDetails {
  return {
    ...raw,
    order_items: raw.order_items ?? [],
    employee: normalizeOne(raw.employee),
    location: normalizeOne(raw.location),
    seen_by_profile: normalizeOne(raw.seen_by_profile),
  } as OrderWithDetails;
}

// ---- Çalışan tarafı ----

export async function fetchMyActiveOrders(): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .in("status", ["new", "seen"])
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []).map(normalizeOrder);
}

export async function fetchMyOrderHistory(limit = 30): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .in("status", ["completed", "cancelled"])
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(normalizeOrder);
}

export async function createOrder(input: {
  locationId: string | null;
  customLocation: string | null;
  note: string | null;
  items: CartItemInput[];
}): Promise<Order> {
  const { data, error } = await supabase.rpc("create_order", {
    p_location_id: input.locationId,
    p_custom_location: input.customLocation,
    p_note: input.note,
    p_items: input.items,
  });

  if (error) throw error;
  return data as Order;
}

export async function cancelOrder(orderId: string): Promise<Order> {
  const { data, error } = await supabase.rpc("cancel_order", { p_order_id: orderId });
  if (error) throw error;
  return data as Order;
}

// ---- Garson tarafı ----

export async function fetchWaiterDashboard(): Promise<{
  newOrders: OrderWithDetails[];
  seenOrders: OrderWithDetails[];
}> {
  const [newOrders, seenOrders] = await Promise.all([fetchNewOrders(), fetchSeenOrders()]);
  return { newOrders, seenOrders };
}

export async function fetchNewOrders(): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .eq("status", "new")
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(normalizeOrder);
}

export async function fetchSeenOrders(): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .eq("status", "seen")
    .order("seen_at", { ascending: true });

  if (error) throw error;
  return (data ?? []).map(normalizeOrder);
}

export async function fetchCompletedOrders(limit = 30): Promise<OrderWithDetails[]> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .in("status", ["completed", "cancelled"])
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []).map(normalizeOrder);
}

export async function fetchOrderById(orderId: string): Promise<OrderWithDetails> {
  const { data, error } = await supabase
    .from("orders")
    .select(ORDER_DETAIL_SELECT)
    .eq("id", orderId)
    .single();

  if (error) throw error;
  return normalizeOrder(data);
}

export async function claimOrder(orderId: string): Promise<Order> {
  const { data, error } = await supabase.rpc("claim_order", { p_order_id: orderId });
  if (error) throw error;
  return data as Order;
}

export async function completeOrder(orderId: string): Promise<Order> {
  const { data, error } = await supabase.rpc("complete_order", { p_order_id: orderId });
  if (error) throw error;
  return data as Order;
}
