import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { cancelOrder, fetchOrderById } from "@/lib/api/orders";
import { showAlert } from "@/lib/alert";
import { safeGoBack } from "@/lib/navigation";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, employeeStatusLabels, radius, shadows, spacing, typography } from "@/constants/theme";

export default function EmployeeOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, loading, error, refetch } = useAsyncData(() => fetchOrderById(id), [id]);
  const [cancelling, setCancelling] = useState(false);

  async function handleCancel() {
    if (!order) return;
    showAlert("Siparişi iptal et", "Bu siparişi iptal etmek istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "İptal Et",
        style: "destructive",
        onPress: async () => {
          setCancelling(true);
          try {
            await cancelOrder(order.id);
            refetch();
          } catch (err) {
            showAlert("Hata", toFriendlyErrorMessage(err));
          } finally {
            setCancelling(false);
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => safeGoBack("/(employee)")} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Sipariş Detayı</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <LoadingView />
      ) : error || !order ? (
        <ErrorState message={error ?? "Sipariş bulunamadı."} onRetry={refetch} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.statusBanner}>
            <MaterialIcons
              name={order.status === "completed" ? "check-circle" : order.status === "cancelled" ? "cancel" : "schedule"}
              size={28}
              color={colors.primary}
            />
            <Text style={styles.statusText}>{employeeStatusLabels[order.status]}</Text>
          </View>

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
            <Button
              label="Siparişi İptal Et"
              onPress={handleCancel}
              variant="outline"
              loading={cancelling}
            />
          ) : null}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
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
