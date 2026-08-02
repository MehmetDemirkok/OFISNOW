import { useCallback, useState } from "react";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { EmployeeOrderCard } from "@/components/employee/EmployeeOrderCard";
import { EmployeeOrderDetailPane } from "@/components/employee/EmployeeOrderDetailPane";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useIsWideWeb } from "@/hooks/useIsWideWeb";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { fetchMyActiveOrders } from "@/lib/api/orders";
import { colors, spacing, typography } from "@/constants/theme";
import type { OrderWithDetails } from "@/types/database";

export default function MyActiveOrdersScreen() {
  const { data, loading, error, refreshing, refetch } = useAsyncData(fetchMyActiveOrders, []);
  const isWideWeb = useIsWideWeb();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useOrdersRealtime(useCallback(() => refetch(), [refetch]));

  function handleSelect(order: OrderWithDetails) {
    if (isWideWeb) {
      setSelectedId(order.id);
    } else {
      router.push(`/(employee)/siparis/${order.id}`);
    }
  }

  const list = (
    <FlatList
      data={data ?? []}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
      onRefresh={refetch}
      refreshing={refreshing}
      ListEmptyComponent={
        <EmptyState icon="inbox" title="Aktif siparişiniz yok" description="Ana sayfadan hızlıca sipariş verebilirsiniz." />
      }
      renderItem={({ item }) => <EmployeeOrderCard order={item} onPress={() => handleSelect(item)} />}
      ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
    />
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Siparişlerim</Text>
        <Text style={styles.subtitle}>Devam eden siparişlerinizi takip edin</Text>
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : isWideWeb ? (
        <View style={styles.splitRow}>
          <View style={styles.splitList}>{list}</View>
          <View style={styles.splitDetail}>
            {selectedId ? (
              <EmployeeOrderDetailPane orderId={selectedId} />
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
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.md,
    gap: 2,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  listContent: {
    padding: spacing.md,
    paddingTop: 0,
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
