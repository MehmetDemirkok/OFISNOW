import type { ReactNode } from "react";
import { Platform, View, useWindowDimensions } from "react-native";

import { colors, webShell } from "@/constants/theme";

const DESKTOP_BREAKPOINT = webShell.breakpoint;
const SHELL_MAX_WIDTH = webShell.maxWidth;

/**
 * Masaüstü tarayıcılarda mobil tasarımı bozmadan içeriği ortalanmış, telefon
 * genişliğinde bir "uygulama kabuğu" içinde gösterir (WhatsApp Web mantığı).
 * Native'de ve dar (mobil) web görünümlerde no-op'tur; tüm ekranlar,
 * kartlar ve alt sekme çubuğu böylece otomatik olarak orijinal mobil
 * ölçülerine döner, ekranlara tek tek dokunmaya gerek kalmaz.
 */
export function WebShell({ children }: { children: ReactNode }) {
  const { width } = useWindowDimensions();

  if (Platform.OS !== "web" || width < DESKTOP_BREAKPOINT) {
    return <View style={{ flex: 1 }}>{children}</View>;
  }

  return (
    <View style={{ flex: 1, alignItems: "center", backgroundColor: colors.surfaceContainerHigh }}>
      <View
        style={{
          position: "relative",
          flex: 1,
          width: "100%",
          maxWidth: SHELL_MAX_WIDTH,
          overflow: "hidden",
          backgroundColor: colors.background,
          // @ts-expect-error web-only CSS, react-native-web geçirir
          boxShadow: "0 0 48px rgba(27,27,35,0.16)",
        }}
      >
        {children}
      </View>
    </View>
  );
}
