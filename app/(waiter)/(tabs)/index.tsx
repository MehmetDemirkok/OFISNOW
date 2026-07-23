import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WaiterOrderCard } from "@/components/waiter/WaiterOrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHero } from "@/components/ui/ScreenHero";
import { useAuth } from "@/context/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { claimOrder, completeOrder, fetchWaiterDashboard } from "@/lib/api/orders";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, spacing, typography } from "@/constants/theme";

export default function WaiterDashboardScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refreshing, refetch } = useAsyncData(fetchWaiterDashboard, []);
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({});

  useOrdersRealtime(
    useCallback(() => {
      refetch();
    }, [refetch])
  );

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, [])
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
    <ScreenContainer edges={["left", "right"]} style={styles.screen}>
      <ScreenHero
        title={`Merhaba ${profile?.full_name?.split(" ")[0] ?? ""} 👋`}
        subtitle="Siparişleri yönetin"
        topInset={insets.top}
        chip={
          newOrders.length > 0
            ? { icon: "notifications-active", label: `${newOrders.length} yeni sipariş` }
            : undefined
        }
      />

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={colors.primary} />}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Yeni Siparişler</Text>
            {newOrders.length === 0 ? (
              <EmptyState icon="inbox" title="Yeni sipariş yok" />
            ) : (
              <View style={styles.list}>
                {newOrders.map((order) => (
                  <WaiterOrderCard
                    key={order.id}
                    order={order}
                    onPress={() => router.push(`/(waiter)/siparis/${order.id}`)}
                    onClaim={() => handleClaim(order.id)}
                    claiming={pendingIds[order.id]}
                  />
                ))}
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Aktif Siparişler</Text>
            {seenOrders.length === 0 ? (
              <EmptyState icon="check-circle-outline" title="Aktif sipariş yok" />
            ) : (
              <View style={styles.list}>
                {seenOrders.map((order) => (
                  <WaiterOrderCard
                    key={order.id}
                    order={order}
                    onPress={() => router.push(`/(waiter)/siparis/${order.id}`)}
                    onComplete={() => handleComplete(order.id)}
                    completing={pendingIds[order.id]}
                  />
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: 140,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  list: {
    gap: spacing.sm,
  },
});
