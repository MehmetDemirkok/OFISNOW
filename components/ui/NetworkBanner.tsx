import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { colors, radius, spacing, typography } from "@/constants/theme";

export function NetworkBanner() {
  const isConnected = useNetworkStatus();

  if (isConnected !== false) return null;

  return (
    <View style={styles.container}>
      <MaterialIcons name="wifi-off" size={18} color="#ffffff" />
      <Text style={styles.text}>İnternet bağlantısı yok. Siparişiniz gönderilemez.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    backgroundColor: colors.error,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  text: {
    ...typography.labelLg,
    color: "#ffffff",
    textTransform: "none",
    letterSpacing: 0,
  },
});
