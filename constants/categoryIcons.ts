import type { ComponentProps } from "react";
import type { MaterialIcons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

/** Kategori adına göre Material Icons ikonu. Bilinmeyen kategoriler için varsayılan ikon döner. */
export function categoryIcon(categoryName: string): IconName {
  const key = categoryName.trim().toLocaleLowerCase("tr-TR");

  if (key.includes("sıcak")) return "coffee";
  if (key.includes("soğuk")) return "local-drink";
  if (key.includes("yemek")) return "restaurant";
  if (key.includes("atıştırmalık")) return "cookie";
  return "more-horiz";
}

const CATEGORY_PALETTE = [
  { bg: "#d1e8d5", fg: "#374b3d" },
  { bg: "#FFF4D9", fg: "#876400" },
  { bg: "#D1F7F1", fg: "#0E7A6E" },
  { bg: "#FFE4E6", fg: "#E11D48" },
  { bg: "#e4f9e5", fg: "#394b3d" },
  { bg: "#EDE9FE", fg: "#7C3AED" },
] as const;

/** Kategori kartlarında görsel çeşitlilik için index'e göre renk çifti (bg/fg) döner. */
export function categoryColor(index: number): { bg: string; fg: string } {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
}
