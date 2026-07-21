import { router } from "expo-router";
import type { Href } from "expo-router";

/**
 * router.back() web'de sayfa doğrudan yüklendiğinde (yenileme, deep link) veya
 * geçmişte önceki ekran olmadığında "GO_BACK was not handled" hatası fırlatır.
 * Geri gidilecek bir ekran yoksa fallbackHref'e replace ile yönlendirir.
 */
export function safeGoBack(fallbackHref: Href) {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackHref);
  }
}
