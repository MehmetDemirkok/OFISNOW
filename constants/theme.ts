// OfisNow: design.md içindeki tasarım diline (renkler, aralıklar, tipografi) uyar.

import type { UserRole } from "@/types/database";

export const colors = {
  primary: "#475b4c",
  primaryDark: "#374b3d",
  primaryLight: "#b5ccb9",
  primaryContainer: "#5f7464",
  onPrimaryContainer: "#e2f9e5",
  primaryFixed: "#d1e8d5",

  // Marka ikinci vurgu rengi (M3 "tertiary" rolü) - adaçayının bir tonu daha koyusu.
  accent: "#485b4c",
  accentDark: "#394b3d",
  accentContainer: "#607464",
  onAccentContainer: "#e4f9e5",

  // Durum/uyarı vurgusu: "bekliyor" durumu ve boş toplama/görevli çağrısı gibi
  // rica rozetleri için turkuaz - bilinçli olarak adaçayı ailesinin dışında
  // tutulur (statü renklerinin birbirinden ayırt edilebilir kalması için).
  secondary: "#0E7A6E",
  secondaryContainer: "#D1F7F1",
  onSecondaryContainer: "#0B5C53",

  // Durum/uyarı vurgusu: "yeni sipariş" ve "görevli çağrısı" rozetleri için amber.
  warning: "#876400",
  warningContainer: "#FFF4D9",

  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  success: "#15803d",
  successContainer: "#dcfce7",

  background: "#f9faf6",
  surface: "#f9faf6",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f3f4f0",
  surfaceContainer: "#edeeea",
  surfaceContainerHigh: "#e7e9e5",
  surfaceContainerHighest: "#e2e3df",

  onSurface: "#1a1c1a",
  onSurfaceVariant: "#434843",
  outline: "#737873",
  outlineVariant: "#c3c8c1",
} as const;

/** WebShell ile aynı kırılma noktası/genişlik: masaüstünde modallar da bu genişliğe göre ortalanır. */
export const webShell = {
  breakpoint: 720,
  maxWidth: 480,
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  gutter: 12,
  md: 16,
  lg: 24,
  xl: 32,
} as const;

export const radius = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
  full: 9999,
} as const;

export const shadows = {
  sm: {
    shadowColor: "#1B1B23",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: "#1B1B23",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  lg: {
    shadowColor: "#1B1B23",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 24,
    elevation: 10,
  },
} as const;

export const typography = {
  display: { fontSize: 26, lineHeight: 32, fontWeight: "800" as const, letterSpacing: -0.4 },
  headlineLg: { fontSize: 24, lineHeight: 32, fontWeight: "700" as const, letterSpacing: -0.3 },
  headlineMobile: { fontSize: 22, lineHeight: 28, fontWeight: "700" as const },
  headlineMd: { fontSize: 20, lineHeight: 28, fontWeight: "600" as const },
  headlineSm: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodyMd: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  labelLg: { fontSize: 12, lineHeight: 16, fontWeight: "600" as const, letterSpacing: 0.4 },
  labelMd: { fontSize: 11, lineHeight: 14, fontWeight: "500" as const },
} as const;

/**
 * Tüm rollerde (çalışan, görevli, ...) aynı yüzen tab bar görünümü için tek
 * kaynak. Yeni bir rol eklenirken veya tab bar teması değişirken sadece
 * burası düzenlenir.
 */
export const tabBarScreenOptions = {
  headerShown: false,
  tabBarActiveTintColor: colors.primary,
  tabBarInactiveTintColor: colors.outline,
  tabBarStyle: {
    position: "absolute" as const,
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    height: 80,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 0,
    paddingBottom: 12,
    paddingTop: 8,
    ...shadows.lg,
  },
  tabBarLabelStyle: { fontSize: 12, lineHeight: 16, fontWeight: "700" as const },
  tabBarItemStyle: { borderRadius: radius.lg, paddingVertical: 2 },
} as const;

export const roleLabels: Record<UserRole, string> = {
  employee: "Çalışan",
  waiter: "Görevli",
};

export const statusLabels: Record<string, string> = {
  new: "YENİ",
  seen: "GÖRÜLDÜ",
  completed: "TAMAMLANDI",
  cancelled: "İPTAL EDİLDİ",
};

/** Çalışan tarafında karmaşık ara durumlar gösterilmez: sadece 2 basit durum. */
export const employeeStatusLabels: Record<string, string> = {
  new: "Sipariş Alındı",
  seen: "Siparişiniz Hazırlanıyor",
  completed: "Sipariş Tamamlandı",
  cancelled: "İptal Edildi",
};
