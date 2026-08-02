import { MaterialIcons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { colors, employeeStatusLabels, radius, shadows, spacing, typography } from "@/constants/theme";
import type { OrderWithDetails } from "@/types/database";

interface EmployeeOrderDetailPanelProps {
  order: OrderWithDetails;
  onCancel: () => void;
  cancelling: boolean;
}

/** Sipariş detayının gövdesi — hem tam ekran push rotasında hem de geniş webde split view'ın sağ panelinde kullanılır. */
export function EmployeeOrderDetailPanel({ order, onCancel, cancelling }: EmployeeOrderDetailPanelProps) {
  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.statusBanner}>
        <MaterialIcons
          name={
            order.status === "completed"
              ? "check-circle"
              : order.status === "cancelled"
                ? "cancel"
                : order.status === "seen"
                  ? "restaurant"
                  : "schedule"
          }
          size={28}
          color={colors.primary}
        />
        <Text style={styles.statusText}>{employeeStatusLabels[order.status]}</Text>
      </View>

      {order.status === "seen" && order.seen_by_profile ? (
        <View style={styles.card}>
          <View style={styles.metaRow}>
            <MaterialIcons name="person" size={18} color={colors.secondary} />
            <Text style={[styles.metaText, { color: colors.secondary, fontWeight: "700" }]}>
              İlgileniyor: {order.seen_by_profile.full_name}
            </Text>
          </View>
        </View>
      ) : null}

      {order.order_type === "pickup" ? (
        <View style={styles.card}>
          <View style={styles.metaRow}>
            <MaterialIcons name="cleaning-services" size={18} color={colors.secondary} />
            <Text style={[styles.metaText, { color: colors.secondary, fontWeight: "700" }]}>
              Boş toplama ricası gönderildi
            </Text>
          </View>
        </View>
      ) : order.order_type === "call" ? (
        <View style={styles.card}>
          <View style={styles.metaRow}>
            <MaterialIcons name="notifications-active" size={18} color={colors.primary} />
            <Text style={[styles.metaText, { color: colors.primary, fontWeight: "700" }]}>
              Görevli çağrısı gönderildi
            </Text>
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
              {item.special_request ? (
                <Text style={styles.itemNote}>Not: {item.special_request}</Text>
              ) : null}
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
      </View>

      {order.status === "new" ? (
        <Button label="Siparişi İptal Et" onPress={onCancel} variant="outline" loading={cancelling} />
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  statusBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryFixed,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  statusText: {
    ...typography.headlineSm,
    color: colors.primary,
  },
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
    ...shadows.sm,
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
