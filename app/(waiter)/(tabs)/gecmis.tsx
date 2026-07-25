import { useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { FlatList, StyleSheet, View } from "react-native";
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
import { fetchCompletedOrders } from "@/lib/api/orders";
import { spacing } from "@/constants/theme";

export default function WaiterHistoryScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refreshing, refetch } = useAsyncData(
    () => fetchCompletedOrders(50),
    []
  );

  useOrdersRealtime(useCallback(() => refetch(), [refetch]));

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, [])
  );

  const hero = (
    <ScreenHero
      title={`Merhaba ${profile?.full_name?.split(" ")[0] ?? ""} 👋`}
      subtitle="Tamamlanan siparişleri görüntüleyin"
      topInset={insets.top}
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
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={refreshing}
          ListHeaderComponent={hero}
          ListHeaderComponentStyle={styles.listHeader}
          ListEmptyComponent={<EmptyState icon="history" title="Henüz tamamlanan sipariş yok" />}
          renderItem={({ item }) => (
            <WaiterOrderCard order={item} onPress={() => router.push(`/(waiter)/siparis/${item.id}`)} />
          )}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
        />
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
});
