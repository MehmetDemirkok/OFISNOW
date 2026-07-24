import { useCallback, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { claimOrder, completeOrder, fetchOrderById } from "@/lib/api/orders";
import { showAlert } from "@/lib/alert";
import { safeGoBack } from "@/lib/navigation";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function WaiterOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { data: order, loading, error, refetch } = useAsyncData(() => fetchOrderById(id), [id]);
  const [processing, setProcessing] = useState(false);

  useOrdersRealtime(useCallback(() => refetch(), [refetch]));

  async function handleClaim() {
    if (!order) return;
    setProcessing(true);
    try {
      await claimOrder(order.id);
      refetch();
    } catch (err) {
      showAlert("Sipariş görülemedi", toFriendlyErrorMessage(err));
      refetch();
    } finally {
      setProcessing(false);
    }
  }

  async function handleComplete() {
    if (!order) return;
    setProcessing(true);
    try {
      await completeOrder(order.id);
      refetch();
    } catch (err) {
      showAlert("İşlem tamamlanamadı", toFriendlyErrorMessage(err));
      refetch();
    } finally {
      setProcessing(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => safeGoBack("/(waiter)")} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Sipariş Detayı</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <LoadingView />
      ) : error || !order ? (
        <ErrorState message={error ?? "Sipariş bulunamadı."} onRetry={refetch} />
      ) : (
        <ScrollView contentContainerStyle={styles.content}>
          <View style={styles.topRow}>
            <View>
              <Text style={styles.employeeName}>{order.employee?.full_name ?? "Çalışan"}</Text>
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
                <Text style={[styles.metaText, { color: colors.primary, fontWeight: "700" }]}>
                  Görevli çağrısı
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
                    <Text style={styles.itemNote}>{item.special_request}</Text>
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
              onPress={handleClaim}
              variant="secondary"
              loading={processing}
              icon={<MaterialIcons name="check-circle" size={20} color="#ffffff" />}
            />
          ) : null}

          {order.status === "seen" ? (
            <Button
              label="TAMAMLANDI"
              onPress={handleComplete}
              variant="outline"
              loading={processing}
              icon={<MaterialIcons name="done-all" size={20} color={colors.primary} />}
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
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
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
