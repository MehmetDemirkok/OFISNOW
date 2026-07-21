// OfisNow: design.md içindeki tasarım diline (renkler, aralıklar, tipografi) uyar.

export const colors = {
  primary: "#4F46E5",
  primaryDark: "#3730A3",
  primaryLight: "#818CF8",
  primaryContainer: "#4338CA",
  onPrimaryContainer: "#ffffff",
  primaryFixed: "#EEF2FF",

  accent: "#F97316",
  accentDark: "#EA580C",
  accentContainer: "#FFEDD5",
  onAccentContainer: "#C2410C",

  secondary: "#0D9488",
  secondaryContainer: "#99F6E4",
  onSecondaryContainer: "#0F766E",

  tertiaryContainerText: "#B45309",
  tertiaryContainerBg: "#fef3c7",

  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  success: "#15803d",
  successContainer: "#dcfce7",

  background: "#FAFAFF",
  surface: "#ffffff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#F5F4FB",
  surfaceContainer: "#EFEEF9",
  surfaceContainerHigh: "#E8E6F5",

  onSurface: "#1B1B23",
  onSurfaceVariant: "#48495A",
  outline: "#7A7B8C",
  outlineVariant: "#D8D7E8",
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
    height: 68,
    borderRadius: radius.xl,
    backgroundColor: colors.surfaceContainerLowest,
    borderTopWidth: 0,
    paddingBottom: 10,
    paddingTop: 10,
    ...shadows.lg,
  },
  tabBarLabelStyle: { fontSize: 12, fontWeight: "700" as const },
  tabBarItemStyle: { borderRadius: radius.lg },
} as const;

export const statusLabels: Record<string, string> = {
  new: "YENİ",
  seen: "GÖRÜLDÜ",
  completed: "TAMAMLANDI",
  cancelled: "İPTAL EDİLDİ",
};

/** Çalışan tarafında karmaşık ara durumlar gösterilmez: sadece 2 basit durum. */
export const employeeStatusLabels: Record<string, string> = {
  new: "Sipariş Alındı",
  seen: "Sipariş Alındı",
  completed: "Sipariş Tamamlandı",
  cancelled: "İptal Edildi",
};
