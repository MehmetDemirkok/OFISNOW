// OfisNow: design.md içindeki tasarım diline (renkler, aralıklar, tipografi) uyar.

export const colors = {
  primary: "#00236f",
  primaryContainer: "#1e3a8a",
  onPrimaryContainer: "#ffffff",
  primaryFixed: "#dce1ff",
  secondary: "#006c49",
  secondaryContainer: "#6cf8bb",
  onSecondaryContainer: "#00714d",
  tertiaryContainerText: "#B45309",
  tertiaryContainerBg: "#fef3c7",
  error: "#ba1a1a",
  errorContainer: "#ffdad6",
  onErrorContainer: "#93000a",
  success: "#15803d",
  successContainer: "#dcfce7",

  background: "#faf8ff",
  surface: "#ffffff",
  surfaceContainerLowest: "#ffffff",
  surfaceContainerLow: "#f4f3fa",
  surfaceContainer: "#eeedf4",
  surfaceContainerHigh: "#e9e7ef",

  onSurface: "#1a1b21",
  onSurfaceVariant: "#444651",
  outline: "#757682",
  outlineVariant: "#c5c5d3",
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
  sm: 8,
  md: 12,
  lg: 16,
  full: 9999,
} as const;

export const typography = {
  headlineLg: { fontSize: 24, lineHeight: 32, fontWeight: "700" as const, letterSpacing: -0.3 },
  headlineMobile: { fontSize: 22, lineHeight: 28, fontWeight: "700" as const },
  headlineMd: { fontSize: 20, lineHeight: 28, fontWeight: "600" as const },
  headlineSm: { fontSize: 18, lineHeight: 24, fontWeight: "600" as const },
  bodyLg: { fontSize: 16, lineHeight: 24, fontWeight: "400" as const },
  bodyMd: { fontSize: 14, lineHeight: 20, fontWeight: "400" as const },
  labelLg: { fontSize: 12, lineHeight: 16, fontWeight: "600" as const, letterSpacing: 0.4 },
  labelMd: { fontSize: 11, lineHeight: 14, fontWeight: "500" as const },
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
