import { useCallback } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { CategoryCard } from "@/components/employee/CategoryCard";
import { EmployeeOrderCard } from "@/components/employee/EmployeeOrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { fetchCategories } from "@/lib/api/catalog";
import { fetchMyActiveOrders, fetchMyOrderHistory } from "@/lib/api/orders";
import { useAsyncData } from "@/hooks/useAsyncData";
import { colors, spacing, typography } from "@/constants/theme";

export default function EmployeeHomeScreen() {
  const { profile, signOut } = useAuth();

  const categories = useAsyncData(fetchCategories, []);
  const activeOrders = useAsyncData(fetchMyActiveOrders, []);
  const recentOrders = useAsyncData(() => fetchMyOrderHistory(3), []);

  const refreshAll = useCallback(() => {
    categories.refetch();
    activeOrders.refetch();
    recentOrders.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isRefreshing = activeOrders.refreshing || categories.refreshing || recentOrders.refreshing;

  return (
    <ScreenContainer>
      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} />}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Merhaba {profile?.full_name?.split(" ")[0] ?? ""} 👋</Text>
            <Text style={styles.subGreeting}>Ne sipariş etmek istersiniz?</Text>
          </View>
          <MaterialIcons
            name="logout"
            size={24}
            color={colors.onSurfaceVariant}
            onPress={signOut}
            suppressHighlighting
          />
        </View>

        <View style={styles.categoryGrid}>
          {(categories.data ?? []).map((category) => (
            <CategoryCard
              key={category.id}
              name={category.name}
              onPress={() => router.push(`/(employee)/kategori/${category.id}?name=${encodeURIComponent(category.name)}`)}
            />
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Aktif Siparişler</Text>
          {(activeOrders.data ?? []).length === 0 ? (
            <EmptyState icon="inbox" title="Aktif siparişiniz yok" />
          ) : (
            <View style={styles.list}>
              {(activeOrders.data ?? []).map((order) => (
                <EmployeeOrderCard
                  key={order.id}
                  order={order}
                  onPress={() => router.push(`/(employee)/siparis/${order.id}`)}
                />
              ))}
            </View>
          )}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Son Siparişler</Text>
          {(recentOrders.data ?? []).length === 0 ? (
            <EmptyState icon="history" title="Henüz sipariş geçmişiniz yok" />
          ) : (
            <View style={styles.list}>
              {(recentOrders.data ?? []).map((order) => (
                <EmployeeOrderCard
                  key={order.id}
                  order={order}
                  onPress={() => router.push(`/(employee)/siparis/${order.id}`)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  greeting: {
    ...typography.headlineMobile,
    color: colors.onSurface,
  },
  subGreeting: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  categoryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
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
