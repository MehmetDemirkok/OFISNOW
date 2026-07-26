import { StyleSheet, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedBackground, type BackgroundIntensity } from "@/components/ui/AnimatedBackground";
import { NetworkBanner } from "@/components/ui/NetworkBanner";
import { colors } from "@/constants/theme";

interface ScreenContainerProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: ("top" | "bottom" | "left" | "right")[];
  /** Ambient animated color wash behind the screen. Defaults to a subtle wash; set "none" to disable. */
  background?: BackgroundIntensity | "none";
}

export function ScreenContainer({ children, style, edges, background = "subtle" }: ScreenContainerProps) {
  return (
    <SafeAreaView style={styles.safeArea} edges={edges}>
      {background !== "none" ? <AnimatedBackground intensity={background} /> : null}
      <NetworkBanner />
      <View style={[styles.container, style]}>{children}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    overflow: "hidden",
  },
  container: {
    flex: 1,
  },
});
