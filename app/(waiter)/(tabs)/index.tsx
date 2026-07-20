import { useCallback, useState } from "react";
import { router } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { WaiterOrderCard } from "@/components/waiter/WaiterOrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { claimOrder, completeOrder, fetchWaiterDashboard } from "@/lib/api/orders";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, spacing, typography } from "@/constants/theme";

export default function WaiterDashboardScreen() {
  const { data, loading, error, refreshing, refetch } = useAsyncData(fetchWaiterDashboard, []);
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({});

  useOrdersRealtime(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  async function handleClaim(orderId: string) {
    setPendingIds((prev) => ({ ...prev, [orderId]: true }));
    try {
      await claimOrder(orderId);
      refetch();
    } catch (err) {
      showAlert("Sipariş görülemedi", toFriendlyErrorMessage(err));
      refetch();
    } finally {
      setPendingIds((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  async function handleComplete(orderId: string) {
    setPendingIds((prev) => ({ ...prev, [orderId]: true }));
    try {
      await completeOrder(orderId);
      refetch();
    } catch (err) {
      showAlert("İşlem tamamlanamadı", toFriendlyErrorMessage(err));
      refetch();
    } finally {
      setPendingIds((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  const newOrders = data?.newOrders ?? [];
  const seenOrders = data?.seenOrders ?? [];

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Siparişler</Text>
        {newOrders.length > 0 ? (
          <View style={styles.newCountBadge}>
            <Text style={styles.newCountText}>{newOrders.length} YENİ</Text>
          </View>
        ) : null}
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} />}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>YENİ SİPARİŞLER</Text>
            {newOrders.length === 0 ? (
              <EmptyState icon="inbox" title="Yeni sipariş yok" />
            ) : (
              newOrders.map((order) => (
                <WaiterOrderCard
                  key={order.id}
                  order={order}
                  onPress={() => router.push(`/(waiter)/siparis/${order.id}`)}
                  onClaim={() => handleClaim(order.id)}
                  claiming={pendingIds[order.id]}
                />
              ))
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>AKTİF SİPARİŞLER</Text>
            {seenOrders.length === 0 ? (
              <EmptyState icon="check-circle-outline" title="Aktif sipariş yok" />
            ) : (
              seenOrders.map((order) => (
                <WaiterOrderCard
                  key={order.id}
                  order={order}
                  onPress={() => router.push(`/(waiter)/siparis/${order.id}`)}
                  onComplete={() => handleComplete(order.id)}
                  completing={pendingIds[order.id]}
                />
              ))
            )}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  newCountBadge: {
    backgroundColor: colors.tertiaryContainerBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: 999,
  },
  newCountText: {
    ...typography.labelLg,
    color: colors.tertiaryContainerText,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    textTransform: "none",
    letterSpacing: 0,
  },
});
