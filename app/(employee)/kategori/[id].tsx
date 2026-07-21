import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ProductCard } from "@/components/employee/ProductCard";
import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchProductsByCategory } from "@/lib/api/catalog";
import { useCart } from "@/context/CartContext";
import { safeGoBack } from "@/lib/navigation";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function CategoryProductsScreen() {
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { data: products, loading, error, refetch } = useAsyncData(
    () => fetchProductsByCategory(id),
    [id]
  );
  const { getQuantity, increment, decrement, totalCount } = useCart();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => safeGoBack("/(employee)")} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title} numberOfLines={1}>
          {name ?? "Ürünler"}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={products ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<EmptyState icon="inbox" title="Bu kategoride ürün bulunamadı" />}
          renderItem={({ item }) => (
            <ProductCard
              product={item}
              quantity={getQuantity(item.id)}
              onIncrement={() => increment(item)}
              onDecrement={() => decrement(item.id)}
            />
          )}
        />
      )}

      {totalCount > 0 ? (
        <View style={styles.fabWrapper}>
          <Pressable
            style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
            onPress={() => router.push("/(employee)/siparis/yeni")}
          >
            <View style={styles.fabLeft}>
              <MaterialIcons name="shopping-cart" size={22} color="#ffffff" />
              <Text style={styles.fabText}>Sepeti Gör</Text>
            </View>
            <View style={styles.fabBadge}>
              <Text style={styles.fabBadgeText}>{totalCount} Ürün</Text>
            </View>
          </Pressable>
        </View>
      ) : null}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
    flex: 1,
    textAlign: "center",
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: 96,
  },
  fabWrapper: {
    position: "absolute",
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
  },
  fab: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.primaryContainer,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.lg,
  },
  fabPressed: {
    opacity: 0.9,
  },
  fabLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  fabText: {
    ...typography.headlineSm,
    color: "#ffffff",
  },
  fabBadge: {
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
  },
  fabBadgeText: {
    ...typography.labelLg,
    color: "#ffffff",
    textTransform: "none",
    letterSpacing: 0,
  },
});
