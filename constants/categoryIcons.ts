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
