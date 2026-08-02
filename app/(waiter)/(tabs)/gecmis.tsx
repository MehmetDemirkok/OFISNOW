import { useCallback, useState } from "react";
import { router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { FlatList, Platform, StyleSheet, View } from "react-native";
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
import { downloadOrdersCsv } from "@/lib/csvExport";
import { fetchCompletedOrders } from "@/lib/api/orders";
import { colors, spacing } from "@/constants/theme";
import type { OrderWithDetails } from "@/types/database";

export default function WaiterHistoryScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refreshing, refetch } = useAsyncData(
    () => fetchCompletedOrders(50),
    []
  );
  const isWideWeb = useIsWideWeb();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useOrdersRealtime(useCallback(() => refetch(), [refetch]));

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, [])
  );

  function handleSelect(order: OrderWithDetails) {
    if (isWideWeb) {
      setSelectedId(order.id);
    } else {
      router.push(`/(waiter)/siparis/${order.id}`);
    }
  }

  const hero = (
    <ScreenHero
      title={`Merhaba ${profile?.full_name?.split(" ")[0] ?? ""} 👋`}
      subtitle="Tamamlanan siparişleri görüntüleyin"
      topInset={insets.top}
      chip={
        Platform.OS === "web" && (data?.length ?? 0) > 0
          ? {
              icon: "download",
              label: "CSV İndir",
              onPress: () => downloadOrdersCsv(`tamamlanan-siparisler-${new Date().toISOString().slice(0, 10)}.csv`, data ?? []),
            }
          : undefined
      }
    />
  );

  const list = (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      onRefresh={refetch}
      refreshing={refreshing}
      ListHeaderComponent={hero}
      ListHeaderComponentStyle={styles.listHeader}
      ListEmptyComponent={<EmptyState icon="history" title="Henüz tamamlanan sipariş yok" />}
      renderItem={({ item }) => <WaiterOrderCard order={item} onPress={() => handleSelect(item)} />}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
    />
  );

  return (
    <ScreenContainer edges={["left", "right"]}>
      {loading ? (
        <>
          {hero}
          <LoadingView />
        </>
      ) : error ? (
        <>
          {hero}
          <ErrorState message={error} onRetry={refetch} />
        </>
      ) : isWideWeb ? (
        <View style={styles.splitRow}>
          <View style={styles.splitList}>{list}</View>
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
        list
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listHeader: {
    marginBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingBottom: 140,
    flexGrow: 1,
  },
  splitRow: {
    flex: 1,
    flexDirection: "row",
  },
  splitList: {
    width: 380,
    borderRightWidth: 1,
    borderRightColor: colors.outlineVariant,
  },
  splitDetail: {
    flex: 1,
  },
});
