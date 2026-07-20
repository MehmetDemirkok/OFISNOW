import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, employeeStatusLabels, radius, spacing, typography } from "@/constants/theme";
import type { OrderWithDetails } from "@/types/database";

const statusColors: Record<string, { bg: string; fg: string; icon: keyof typeof MaterialIcons.glyphMap }> = {
  new: { bg: colors.tertiaryContainerBg, fg: colors.tertiaryContainerText, icon: "schedule" },
  seen: { bg: colors.tertiaryContainerBg, fg: colors.tertiaryContainerText, icon: "schedule" },
  completed: { bg: colors.successContainer, fg: colors.success, icon: "check-circle" },
  cancelled: { bg: colors.errorContainer, fg: colors.onErrorContainer, icon: "cancel" },
};

function formatTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

export function EmployeeOrderCard({
  order,
  onPress,
}: {
  order: OrderWithDetails;
  onPress?: () => void;
}) {
  const itemsSummary = order.order_items.map((it) => `${it.quantity}x ${it.product_name}`).join(", ");
  const locationName = order.location?.name ?? order.custom_location ?? "Belirtilmedi";
  const statusStyle = statusColors[order.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    >
      <View style={styles.row}>
        <View style={{ flex: 1 }}>
          <Text style={styles.items} numberOfLines={2}>
            {itemsSummary}
          </Text>
          <View style={styles.metaRow}>
            <MaterialIcons name="location-on" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.meta}>{locationName}</Text>
            <Text style={styles.metaDot}>•</Text>
            <Text style={styles.meta}>{formatTime(order.created_at)}</Text>
          </View>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: statusStyle.bg }]}>
          <MaterialIcons name={statusStyle.icon} size={14} color={statusStyle.fg} />
          <Text style={[styles.statusText, { color: statusStyle.fg }]}>
            {employeeStatusLabels[order.status]}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
  },
  pressed: {
    opacity: 0.85,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  items: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  meta: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  metaDot: {
    color: colors.onSurfaceVariant,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  statusText: {
    ...typography.labelMd,
    fontWeight: "700",
  },
});
