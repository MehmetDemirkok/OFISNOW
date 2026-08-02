import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { colors, radius, spacing, typography } from "@/constants/theme";
import type { OrderWithDetails } from "@/types/database";

interface WaiterOrderDetailPanelProps {
  order: OrderWithDetails;
  onClaim: () => void;
  onComplete: () => void;
  processing: boolean;
}

/** Sipariş detayının gövdesi — hem tam ekran push rotasında hem de geniş webde split view'ın sağ panelinde kullanılır. */
export function WaiterOrderDetailPanel({ order, onClaim, onComplete, processing }: WaiterOrderDetailPanelProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.topRow}>
        <View>
          <Text style={styles.employeeName}>{order.employee?.full_name ?? "Çalışan"}</Text>
          {order.employee?.job_title ? <Text style={styles.jobTitle}>{order.employee.job_title}</Text> : null}
          <Text style={styles.time}>
            {new Date(order.created_at).toLocaleString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
              day: "2-digit",
              month: "2-digit",
            })}
          </Text>
        </View>
        <StatusBadge status={order.status} />
      </View>

      {order.order_type === "pickup" ? (
        <View style={styles.card}>
          <View style={styles.metaRow}>
            <MaterialIcons name="cleaning-services" size={18} color={colors.secondary} />
            <Text style={[styles.metaText, { color: colors.secondary, fontWeight: "700" }]}>
              Boşları alabilir misiniz? Acelesi yok
            </Text>
          </View>
        </View>
      ) : order.order_type === "call" ? (
        <View style={styles.card}>
          <View style={styles.metaRow}>
            <MaterialIcons name="notifications-active" size={18} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.primary, fontWeight: "700" }]}>Görevli çağrısı</Text>
          </View>
        </View>
      ) : (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Ürünler</Text>
          {order.order_items.map((item) => (
            <View key={item.id} style={styles.itemRow}>
              <Text style={styles.itemName}>
                {item.quantity}x {item.product_name}
              </Text>
              {item.special_request ? <Text style={styles.itemNote}>{item.special_request}</Text> : null}
            </View>
          ))}
        </View>
      )}

      <View style={styles.card}>
        <View style={styles.metaRow}>
          <MaterialIcons name="location-on" size={18} color={colors.onSurfaceVariant} />
          <Text style={styles.metaText}>{order.location?.name ?? order.custom_location}</Text>
        </View>
        {order.note ? (
          <View style={styles.metaRow}>
            <MaterialIcons name="sticky-note-2" size={18} color={colors.onSurfaceVariant} />
            <Text style={styles.metaText}>{order.note}</Text>
          </View>
        ) : null}
        {order.status === "seen" && order.seen_by_profile ? (
          <View style={styles.metaRow}>
            <MaterialIcons name="person" size={18} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.primary }]}>
              {order.seen_by_profile.full_name} ilgileniyor
            </Text>
          </View>
        ) : null}
      </View>

      {order.status === "new" ? (
        <Button
          label="GÖRDÜM"
          onPress={onClaim}
          variant="secondary"
          loading={processing}
          icon={<MaterialIcons name="check-circle" size={20} color="#ffffff" />}
        />
      ) : null}

      {order.status === "seen" ? (
        <Button
          label="TAMAMLANDI"
          onPress={onComplete}
          variant="outline"
          loading={processing}
          icon={<MaterialIcons name="done-all" size={20} color={colors.primary} />}
        />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  employeeName: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  jobTitle: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginTop: 1,
  },
  time: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardTitle: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    textTransform: "none",
    letterSpacing: 0,
  },
  itemRow: {
    gap: 2,
  },
  itemName: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  itemNote: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  metaText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flexShrink: 1,
  },
});
