import type { ComponentProps } from "react";
import type { MaterialCommunityIcons } from "@expo/vector-icons";

type IconName = ComponentProps<typeof MaterialCommunityIcons>["name"];

interface Visual {
  icon: IconName;
  bg: string;
  fg: string;
}

const COFFEE: Visual = { icon: "coffee", bg: "#F3E5DC", fg: "#7C4A2D" };
const COFFEE_MILK: Visual = { icon: "coffee-to-go", bg: "#F3E5DC", fg: "#7C4A2D" };
const TEA: Visual = { icon: "tea", bg: "#FDE2E1", fg: "#C0392B" };
const HERBAL_TEA: Visual = { icon: "tea-outline", bg: "#E3F3E1", fg: "#2F7D3C" };
const WATER: Visual = { icon: "cup-water", bg: "#DFF3FB", fg: "#0E7490" };
const SODA: Visual = { icon: "bottle-soda-classic", bg: "#E9E9EE", fg: "#3B3B45" };
const JUICE: Visual = { icon: "fruit-citrus", bg: "#FFE8D1", fg: "#D9770B" };
const AYRAN: Visual = { icon: "cup", bg: "#EAF4FF", fg: "#2563AC" };
const SHAKE: Visual = { icon: "cup", bg: "#FCE7F3", fg: "#BE185D" };
const BEER: Visual = { icon: "beer", bg: "#F3E8FF", fg: "#7C3AED" };
const WINE: Visual = { icon: "glass-wine", bg: "#F3E8FF", fg: "#7C3AED" };
const COCKTAIL: Visual = { icon: "glass-cocktail", bg: "#F3E8FF", fg: "#7C3AED" };
const BAKERY: Visual = { icon: "food-croissant", bg: "#FDECC8", fg: "#B45309" };
const BREAD: Visual = { icon: "bread-slice", bg: "#FDECC8", fg: "#B45309" };
const PRETZEL: Visual = { icon: "pretzel", bg: "#FDECC8", fg: "#B45309" };
const SANDWICH: Visual = { icon: "baguette", bg: "#FDECC8", fg: "#B45309" };
const CAKE: Visual = { icon: "cake-variant", bg: "#FCE7F3", fg: "#BE185D" };
const COOKIE: Visual = { icon: "cookie", bg: "#FCE7F3", fg: "#BE185D" };
const MUFFIN: Visual = { icon: "muffin", bg: "#FCE7F3", fg: "#BE185D" };
const ICE_CREAM: Visual = { icon: "ice-cream", bg: "#FCE7F3", fg: "#BE185D" };
const SNACK: Visual = { icon: "popcorn", bg: "#FEF9C3", fg: "#A16207" };
const PIZZA: Visual = { icon: "pizza", bg: "#DCFCE7", fg: "#15803D" };
const BURGER: Visual = { icon: "hamburger", bg: "#DCFCE7", fg: "#15803D" };
const NOODLES: Visual = { icon: "noodles", bg: "#DCFCE7", fg: "#15803D" };
const RICE: Visual = { icon: "rice", bg: "#DCFCE7", fg: "#15803D" };
const EGG: Visual = { icon: "egg-fried", bg: "#DCFCE7", fg: "#15803D" };
const CHEESE: Visual = { icon: "cheese", bg: "#DCFCE7", fg: "#15803D" };
const FISH: Visual = { icon: "fish", bg: "#DCFCE7", fg: "#15803D" };
const SALAD: Visual = { icon: "leaf", bg: "#DCFCE7", fg: "#15803D" };
const MEAL: Visual = { icon: "silverware-fork-knife", bg: "#DCFCE7", fg: "#15803D" };
const GENERIC: Visual = { icon: "food-variant", bg: "#E8E6F5", fg: "#48495A" };

const RULES: Array<{ test: RegExp; visual: Visual }> = [
  { test: /türk kahvesi|espresso|filtre kahve|americano|mocha|moka/, visual: COFFEE },
  { test: /cappuccino|latte|sütlü kahve/, visual: COFFEE_MILK },
  { test: /kahve/, visual: COFFEE },
  { test: /ıhlamur|nane|papatya|bitki çayı|adaçayı/, visual: HERBAL_TEA },
  { test: /çay/, visual: TEA },
  { test: /maden suyu|soda(?!syum)|gazoz|kola|cola|fanta|sprite/, visual: SODA },
  { test: /\bsu\b|\bsu[şs]e\b/, visual: WATER },
  { test: /ayran/, visual: AYRAN },
  { test: /limonata|meyve suyu|portakal suyu|elma suyu|vişne suyu|şeftali suyu/, visual: JUICE },
  { test: /smoothie|milkshake|frappe/, visual: SHAKE },
  { test: /bira/, visual: BEER },
  { test: /şarap/, visual: WINE },
  { test: /kokteyl/, visual: COCKTAIL },
  { test: /simit/, visual: PRETZEL },
  { test: /poğaça|börek|kruvasan/, visual: BAKERY },
  { test: /tost|ekmek/, visual: BREAD },
  { test: /sandviç|sandwich/, visual: SANDWICH },
  { test: /kek|pasta(?!\s?nsuyu)/, visual: CAKE },
  { test: /kurabiye|bisküvi/, visual: COOKIE },
  { test: /cupcake|kap kek|muffin/, visual: MUFFIN },
  { test: /dondurma/, visual: ICE_CREAM },
  { test: /cips|kraker|patlamış mısır|çerez/, visual: SNACK },
  { test: /pizza/, visual: PIZZA },
  { test: /hamburger|burger/, visual: BURGER },
  { test: /makarna|noodle|erişte/, visual: NOODLES },
  { test: /pilav|\brice\b/, visual: RICE },
  { test: /yumurta/, visual: EGG },
  { test: /peynir/, visual: CHEESE },
  { test: /balık/, visual: FISH },
  { test: /salata/, visual: SALAD },
  { test: /meze|yemek|tabak/, visual: MEAL },
];

const CATEGORY_FALLBACK: Array<{ test: RegExp; visual: Visual }> = [
  { test: /sıcak/, visual: COFFEE },
  { test: /soğuk/, visual: WATER },
  { test: /yemek/, visual: MEAL },
  { test: /atıştırmalık/, visual: SNACK },
];

/** Ürün adına (gerekirse kategori adına) göre menüde gösterilecek ikon + renk çifti. */
export function productVisual(productName: string, categoryName?: string): Visual {
  const name = productName.trim().toLocaleLowerCase("tr-TR");

  for (const rule of RULES) {
    if (rule.test.test(name)) return rule.visual;
  }

  if (categoryName) {
    const category = categoryName.trim().toLocaleLowerCase("tr-TR");
    for (const rule of CATEGORY_FALLBACK) {
      if (rule.test.test(category)) return rule.visual;
    }
  }

  return GENERIC;
}
