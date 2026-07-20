import { supabase } from "@/lib/supabase";
import type { Category, Location, Product } from "@/types/database";

export async function fetchCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data as Category[];
}

export async function fetchProductsByCategory(categoryId: string): Promise<Product[]> {
  const { data, error } = await supabase
    .from("products")
    .select("*")
    .eq("category_id", categoryId)
    .eq("is_active", true)
    .order("name", { ascending: true });

  if (error) throw error;
  return data as Product[];
}

export async function fetchLocations(): Promise<Location[]> {
  const { data, error } = await supabase
    .from("locations")
    .select("*")
    .eq("is_active", true)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return data as Location[];
}

// ---- Admin: kategori yönetimi ----
export async function fetchAllCategories(): Promise<Category[]> {
  const { data, error } = await supabase.from("categories").select("*").order("sort_order");
  if (error) throw error;
  return data as Category[];
}

export async function fetchCategoryById(id: string): Promise<Category> {
  const { data, error } = await supabase.from("categories").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Category;
}

export async function createCategory(input: { name: string; sort_order: number }) {
  const { error } = await supabase.from("categories").insert(input);
  if (error) throw error;
}

export async function updateCategory(id: string, patch: Partial<Category>) {
  const { error } = await supabase.from("categories").update(patch).eq("id", id);
  if (error) throw error;
}

// ---- Admin: ürün yönetimi ----
export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase.from("products").select("*").order("name");
  if (error) throw error;
  return data as Product[];
}

export async function fetchProductById(id: string): Promise<Product> {
  const { data, error } = await supabase.from("products").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Product;
}

export async function createProduct(input: {
  category_id: string;
  name: string;
  description: string | null;
  price: number | null;
}) {
  const { error } = await supabase.from("products").insert(input);
  if (error) throw error;
}

export async function updateProduct(id: string, patch: Partial<Product>) {
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw error;
}

// ---- Admin: konum yönetimi ----
export async function fetchAllLocations(): Promise<Location[]> {
  const { data, error } = await supabase.from("locations").select("*").order("sort_order");
  if (error) throw error;
  return data as Location[];
}

export async function fetchLocationById(id: string): Promise<Location> {
  const { data, error } = await supabase.from("locations").select("*").eq("id", id).single();
  if (error) throw error;
  return data as Location;
}

export async function createLocation(input: { name: string; sort_order: number }) {
  const { error } = await supabase.from("locations").insert(input);
  if (error) throw error;
}

export async function updateLocation(id: string, patch: Partial<Location>) {
  const { error } = await supabase.from("locations").update(patch).eq("id", id);
  if (error) throw error;
}
