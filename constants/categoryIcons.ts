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
  { bg: "#EEF2FF", fg: "#4F46E5" },
  { bg: "#FFEDD5", fg: "#F97316" },
  { bg: "#CCFBF1", fg: "#0D9488" },
  { bg: "#FFE4E6", fg: "#E11D48" },
  { bg: "#FEF3C7", fg: "#D97706" },
  { bg: "#EDE9FE", fg: "#7C3AED" },
] as const;

/** Kategori kartlarında görsel çeşitlilik için index'e göre renk çifti (bg/fg) döner. */
export function categoryColor(index: number): { bg: string; fg: string } {
  return CATEGORY_PALETTE[index % CATEGORY_PALETTE.length];
}
