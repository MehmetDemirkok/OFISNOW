import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { colors, radius, spacing, typography } from "@/constants/theme";
import type { OrderWithDetails } from "@/types/database";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

interface WaiterOrderCardProps {
  order: OrderWithDetails;
  onPress?: () => void;
  onClaim?: () => void;
  onComplete?: () => void;
  claiming?: boolean;
  completing?: boolean;
}

export function WaiterOrderCard({
  order,
  onPress,
  onClaim,
  onComplete,
  claiming,
  completing,
}: WaiterOrderCardProps) {
  const isNew = order.status === "new";
  const isSeen = order.status === "seen";

  return (
    <Pressable
      onPress={onPress}
      style={[styles.card, isNew && styles.cardNew, !isNew && styles.cardMuted]}
    >
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.employeeName}>{order.employee?.full_name ?? "Çalışan"}</Text>
          <View style={styles.timeRow}>
            <MaterialIcons name="schedule" size={14} color={colors.onSurfaceVariant} />
            <Text style={styles.time}>{formatTime(order.created_at)}</Text>
          </View>
        </View>
        {isNew ? (
          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>YENİ</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.itemsBox}>
        {order.order_items.map((item) => (
          <View key={item.id}>
            <Text style={styles.itemText}>
              {item.quantity}x {item.product_name}
            </Text>
            {item.special_request ? (
              <Text style={styles.specialText}>{item.special_request}</Text>
            ) : null}
          </View>
        ))}
      </View>

      <View style={styles.footerRow}>
        <View style={styles.locationRow}>
          <MaterialIcons name="location-on" size={16} color={colors.onSurfaceVariant} />
          <Text style={styles.locationText}>{order.location?.name ?? order.custom_location}</Text>
        </View>
        {isSeen ? (
          <Text style={styles.seenByText}>
            {order.seen_by_profile?.full_name
              ? `${order.seen_by_profile.full_name} ilgileniyor`
              : "Görüldü"}
          </Text>
        ) : null}
      </View>

      {order.note ? (
        <View style={styles.noteRow}>
          <MaterialIcons name="sticky-note-2" size={14} color={colors.onSurfaceVariant} />
          <Text style={styles.noteText}>{order.note}</Text>
        </View>
      ) : null}

      {isNew && onClaim ? (
        <Button
          label="GÖRDÜM"
          onPress={onClaim}
          variant="secondary"
          loading={claiming}
          icon={<MaterialIcons name="check-circle" size={20} color="#ffffff" />}
        />
      ) : null}

      {isSeen && onComplete ? (
        <Button
          label="TAMAMLANDI"
          onPress={onComplete}
          variant="outline"
          loading={completing}
          icon={<MaterialIcons name="done-all" size={20} color={colors.primary} />}
        />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardNew: {
    borderColor: colors.secondaryContainer,
  },
  cardMuted: {
    opacity: 0.95,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  employeeName: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 2,
  },
  time: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  newBadge: {
    backgroundColor: colors.tertiaryContainerBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  newBadgeText: {
    ...typography.labelLg,
    color: colors.tertiaryContainerText,
  },
  itemsBox: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 4,
  },
  itemText: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  specialText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  locationText: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    textTransform: "none",
    letterSpacing: 0,
  },
  seenByText: {
    ...typography.labelMd,
    color: colors.primary,
    fontStyle: "italic",
  },
  noteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  noteText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    flexShrink: 1,
  },
});
