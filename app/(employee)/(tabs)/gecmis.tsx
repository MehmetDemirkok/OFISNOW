import { useCallback } from "react";
import { router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { FlatList, StyleSheet, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmployeeOrderCard } from "@/components/employee/EmployeeOrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHero } from "@/components/ui/ScreenHero";
import { useAuth } from "@/context/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { fetchMyOrderHistory } from "@/lib/api/orders";
import { spacing } from "@/constants/theme";

export default function MyOrderHistoryScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const { data, loading, error, refreshing, refetch } = useAsyncData(() => fetchMyOrderHistory(50), []);

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
      subtitle="Tamamlanan ve iptal edilen siparişleriniz"
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
          ListEmptyComponent={<EmptyState icon="history" title="Henüz sipariş geçmişiniz yok" />}
          renderItem={({ item }) => (
            <EmployeeOrderCard order={item} onPress={() => router.push(`/(employee)/siparis/${item.id}`)} />
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
