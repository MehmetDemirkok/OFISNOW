import { StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, statusLabels, typography } from "@/constants/theme";
import type { OrderStatus } from "@/types/database";

const palette: Record<OrderStatus, { bg: string; fg: string }> = {
  new: { bg: colors.tertiaryContainerBg, fg: colors.tertiaryContainerText },
  seen: { bg: colors.primaryFixed, fg: colors.primary },
  completed: { bg: colors.successContainer, fg: colors.success },
  cancelled: { bg: colors.errorContainer, fg: colors.onErrorContainer },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const { bg, fg } = palette[status];

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={[styles.text, { color: fg }]}>{statusLabels[status]}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.full,
  },
  text: {
    ...typography.labelLg,
  },
});
