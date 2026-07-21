import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, employeeStatusLabels, radius, shadows, spacing, typography } from "@/constants/theme";
import type { OrderWithDetails } from "@/types/database";

const statusColors: Record<
  string,
  { bg: string; fg: string; bar: string; icon: keyof typeof MaterialIcons.glyphMap }
> = {
  new: { bg: colors.tertiaryContainerBg, fg: colors.tertiaryContainerText, bar: colors.tertiaryContainerText, icon: "schedule" },
  seen: { bg: colors.tertiaryContainerBg, fg: colors.tertiaryContainerText, bar: colors.tertiaryContainerText, icon: "schedule" },
  completed: { bg: colors.successContainer, fg: colors.success, bar: colors.success, icon: "check-circle" },
  cancelled: { bg: colors.errorContainer, fg: colors.onErrorContainer, bar: colors.error, icon: "cancel" },
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
  const isCall = order.order_type === "call";
  const isPickup = order.order_type === "pickup";
  const itemsSummary = isPickup
    ? "Boş toplama ricası"
    : isCall
      ? "Görevli çağrısı"
      : order.order_items.map((it) => `${it.quantity}x ${it.product_name}`).join(", ");
  const locationName = order.location?.name ?? order.custom_location ?? "Belirtilmedi";
  const statusStyle = statusColors[order.status];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && onPress && styles.pressed]}
    >
      <View style={[styles.bar, { backgroundColor: statusStyle.bar }]} />
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
    flexDirection: "row",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    overflow: "hidden",
    ...shadows.sm,
  },
  pressed: {
    opacity: 0.9,
  },
  bar: {
    width: 5,
  },
  row: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  items: {
    ...typography.bodyLg,
    color: colors.onSurface,
    fontWeight: "600",
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
    borderRadius: radius.full,
  },
  statusText: {
    ...typography.labelMd,
    fontWeight: "700",
  },
});
