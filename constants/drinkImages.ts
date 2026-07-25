import type { ImageSourcePropType } from "react-native";

// Noto Emoji (Apache License 2.0, https://github.com/googlefonts/noto-emoji) -
// tek tip, tutarlı stilde hazır içecek görselleri. Ürün adına göre eşleştirilir;
// garson kendi görselini yüklerse (product.image_url) bu görsellerin yerini alır.
const DRINK_IMAGES: Array<{ test: RegExp; source: ImageSourcePropType }> = [
  {
    test: /türk kahvesi|espresso|filtre kahve|americano|cappuccino|latte|mocha|moka|kahve/,
    source: require("../assets/drinks/coffee.png"),
  },
  {
    test: /ıhlamur|nane|papatya|bitki çayı|adaçayı|çay/,
    source: require("../assets/drinks/tea.png"),
  },
  {
    test: /maden suyu|soda(?!syum)|gazoz|kola|cola|fanta|sprite/,
    source: require("../assets/drinks/soda.png"),
  },
  {
    test: /ayran|\bsüt\b|\bmilk\b/,
    source: require("../assets/drinks/milk.png"),
  },
  {
    test: /limonata|meyve suyu|portakal suyu|elma suyu|vişne suyu|şeftali suyu|\bjuice\b/,
    source: require("../assets/drinks/juice.png"),
  },
  {
    test: /\bbira\b/,
    source: require("../assets/drinks/beer.png"),
  },
  {
    test: /şarap/,
    source: require("../assets/drinks/wine.png"),
  },
  {
    test: /kokteyl|smoothie|milkshake|frappe/,
    source: require("../assets/drinks/cocktail.png"),
  },
  {
    test: /\bsu\b/,
    source: require("../assets/drinks/water.png"),
  },
];

/** Ürün adına göre hazır içecek görseli döner; eşleşme yoksa null (ikon placeholder'a düşülür). */
export function drinkImage(productName: string): ImageSourcePropType | null {
  const name = productName.trim().toLocaleLowerCase("tr-TR");
  for (const { test, source } of DRINK_IMAGES) {
    if (test.test(name)) return source;
  }
  return null;
}
