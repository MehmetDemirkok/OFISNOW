import { supabase } from "@/lib/supabase";
import type { Category, Product } from "@/types/database";

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

// ---- Çalışan: kategori yönetimi ----
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

export async function deleteCategory(id: string): Promise<void> {
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) throw error;
}

// ---- Çalışan: ürün yönetimi ----
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
}) {
  const { error } = await supabase.from("products").insert(input);
  if (error) throw error;
}

export async function updateProduct(id: string, patch: Partial<Product>) {
  const { error } = await supabase.from("products").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
}
