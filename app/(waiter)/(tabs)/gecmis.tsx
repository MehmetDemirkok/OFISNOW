import { router } from "expo-router";
import { FlatList, StyleSheet, Text, View } from "react-native";

import { WaiterOrderCard } from "@/components/waiter/WaiterOrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchCompletedOrders } from "@/lib/api/orders";
import { colors, spacing, typography } from "@/constants/theme";

export default function WaiterHistoryScreen() {
  const { data, loading, error, refreshing, refetch } = useAsyncData(
    () => fetchCompletedOrders(50),
    []
  );

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Geçmiş Siparişler</Text>
        <Text style={styles.subtitle}>Tamamlanan siparişleri görüntüleyin</Text>
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
