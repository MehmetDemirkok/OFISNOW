/**
 * Çay/kahve gibi sıcak içeceklerde ürün adına göre çoktan seçmeli özelleştirme
 * grupları üretir (ör. Türk Kahvesi için şeker seviyesi, Çay için boy + şeker
 * adedi). Katalogdaki ürün adı eşleşmezse boş dizi döner ve arayüz serbest
 * metin "özel istek" alanına geri düşer (bkz. app/(employee)/siparis/yeni.tsx).
 */
export interface ProductOptionGroup {
  key: string;
  label: string;
  choices: string[];
}

const COFFEE_KEYWORDS = ["kahve", "espresso", "latte", "americano", "cappuccino", "moka", "mocha"];
const TEA_KEYWORDS = ["çay", "chai"];

function normalize(name: string): string {
  return name.toLocaleLowerCase("tr-TR");
}

export function getProductOptionGroups(productName: string): ProductOptionGroup[] {
  const name = normalize(productName);

  if (TEA_KEYWORDS.some((kw) => name.includes(kw))) {
    return [
      { key: "boy", label: "Boy", choices: ["Küçük Boy", "Büyük Boy"] },
      { key: "seker", label: "Şeker", choices: ["Şekersiz", "1 Şeker", "2 Şeker", "3 Şeker"] },
    ];
  }

  if (COFFEE_KEYWORDS.some((kw) => name.includes(kw))) {
    if (name.includes("türk")) {
      return [{ key: "seker", label: "Şeker", choices: ["Sade", "Az Şekerli", "Orta", "Şekerli"] }];
    }
    return [{ key: "seker", label: "Şeker", choices: ["Şekersiz", "Şekerli"] }];
  }

  return [];
}

export function buildDefaultOptionSelections(groups: ProductOptionGroup[]): Record<string, string> {
  const selections: Record<string, string> = {};
  for (const group of groups) {
    selections[group.key] = group.choices[0]!;
  }
  return selections;
}

export function composeSpecialRequest(
  groups: ProductOptionGroup[],
  selections: Record<string, string>
): string {
  return groups
    .map((group) => selections[group.key])
    .filter((value): value is string => !!value)
    .join(", ");
}
