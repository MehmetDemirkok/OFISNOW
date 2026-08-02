import type { ReactNode } from "react";
import { Platform, View } from "react-native";

import { colors, webShell } from "@/constants/theme";
import { useIsWideWeb } from "@/hooks/useIsWideWeb";

const SHELL_MAX_WIDTH = webShell.contentMaxWidth;

/**
 * Geniş masaüstü tarayıcılarda içeriği normal bir web sayfası gibi, geniş bir
 * sütuna ortalanmış olarak gösterir. Native'de ve dar (mobil) web
 * görünümlerde no-op'tur; tüm ekranlar orijinal mobil ölçülerine döner.
 */
export function WebShell({ children }: { children: ReactNode }) {
  const isWideWeb = useIsWideWeb();

  if (Platform.OS !== "web" || !isWideWeb) {
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
          backgroundColor: colors.background,
        }}
      >
        {children}
      </View>
    </View>
  );
}
