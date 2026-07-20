import { router } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { EmployeeOrderCard } from "@/components/employee/EmployeeOrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchMyActiveOrders } from "@/lib/api/orders";
import { colors, spacing, typography } from "@/constants/theme";

export default function MyActiveOrdersScreen() {
  const { data, loading, error, refreshing, refetch } = useAsyncData(fetchMyActiveOrders, []);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Siparişlerim</Text>
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
          ListEmptyComponent={
            <EmptyState icon="inbox" title="Aktif siparişiniz yok" description="Ana sayfadan hızlıca sipariş verebilirsiniz." />
          }
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
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
});
