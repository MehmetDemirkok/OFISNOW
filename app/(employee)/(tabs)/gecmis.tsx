import { useCallback } from "react";
import { router } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { EmployeeOrderCard } from "@/components/employee/EmployeeOrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { fetchMyOrderHistory } from "@/lib/api/orders";
import { colors, spacing, typography } from "@/constants/theme";

export default function MyOrderHistoryScreen() {
  const { data, loading, error, refreshing, refetch } = useAsyncData(() => fetchMyOrderHistory(50), []);

  useOrdersRealtime(useCallback(() => refetch(), [refetch]));

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Geçmiş Siparişler</Text>
        <Text style={styles.subtitle}>Tamamlanan ve iptal edilen siparişleriniz</Text>
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={data ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={refreshing}
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
});
