import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { WaiterOrderCard } from "@/components/waiter/WaiterOrderCard";
import { WaiterOrderDetailPane } from "@/components/waiter/WaiterOrderDetailPane";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHero } from "@/components/ui/ScreenHero";
import { useAuth } from "@/context/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useIsWideWeb } from "@/hooks/useIsWideWeb";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { claimOrder, completeOrder, fetchWaiterDashboard } from "@/lib/api/orders";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, spacing, typography } from "@/constants/theme";
import type { OrderWithDetails } from "@/types/database";

export default function WaiterDashboardScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refreshing, refetch } = useAsyncData(fetchWaiterDashboard, []);
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({});
  const isWideWeb = useIsWideWeb();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Bildirim sesi + tarayıcı ses kilidi artık kökte (app/_layout.tsx,
  // useWaiterOrderSound) çalınıyor — hangi sekmede olursa olsun kesintisiz
  // çalışması için. Burada yalnızca bu ekranın verisini tazelemek kalıyor.
  useOrdersRealtime(useCallback(() => refetch(), [refetch]));

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

  function handleSelect(order: OrderWithDetails) {
    if (isWideWeb) {
      setSelectedId(order.id);
    } else {
      router.push(`/(waiter)/siparis/${order.id}`);
    }
  }

  const newOrders = data?.newOrders ?? [];
  const seenOrders = data?.seenOrders ?? [];

  const content = (
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
                onPress={() => handleSelect(order)}
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
                onPress={() => handleSelect(order)}
                onComplete={() => handleComplete(order.id)}
                completing={pendingIds[order.id]}
              />
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );

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
      ) : isWideWeb ? (
        <View style={styles.splitRow}>
          <View style={styles.splitList}>{content}</View>
          <View style={styles.splitDetail}>
            {selectedId ? (
              <WaiterOrderDetailPane orderId={selectedId} />
            ) : (
              <EmptyState
                icon="touch-app"
                title="Bir sipariş seçin"
                description="Detayını görmek için soldaki listeden bir sipariş seçin."
              />
            )}
          </View>
        </View>
      ) : (
        content
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
  splitRow: {
    flex: 1,
    flexDirection: "row",
  },
  splitList: {
    width: 420,
    borderRightWidth: 1,
    borderRightColor: colors.outlineVariant,
  },
  splitDetail: {
    flex: 1,
  },
});
