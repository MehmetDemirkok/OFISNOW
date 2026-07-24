import { useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import {
  fetchCompletedOrders,
  fetchMyActiveOrders,
  fetchMyOrderHistory,
  fetchNewOrders,
  fetchSeenOrders,
} from "@/lib/api/orders";
import { safeGoBack } from "@/lib/navigation";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";
import type { OrderWithDetails } from "@/types/database";

type Period = "today" | "7d" | "30d" | "month";

const PERIOD_OPTIONS: { key: Period; label: string }[] = [
  { key: "today", label: "Bugün" },
  { key: "7d", label: "Son 7 Gün" },
  { key: "30d", label: "Son 30 Gün" },
  { key: "month", label: "Bu Ay" },
];

const DAY_LABELS = ["Paz", "Pzt", "Sal", "Çar", "Per", "Cum", "Cmt"];
const TREND_DAYS = 7;
const TREND_BAR_MAX_HEIGHT = 72;

async function loadEmployeeOrders() {
  const [active, history] = await Promise.all([fetchMyActiveOrders(), fetchMyOrderHistory(150)]);
  return { pendingCount: active.length, orders: history };
}

async function loadWaiterOrders() {
  const [newOrders, seenOrders, completed] = await Promise.all([
    fetchNewOrders(),
    fetchSeenOrders(),
    fetchCompletedOrders(150),
  ]);
  return { pendingCount: newOrders.length + seenOrders.length, orders: completed };
}

function orderReferenceDate(order: OrderWithDetails): Date {
  return new Date(order.completed_at ?? order.created_at);
}

function isWithinPeriod(order: OrderWithDetails, period: Period): boolean {
  const date = orderReferenceDate(order);
  const now = new Date();

  if (period === "today") return date.toDateString() === now.toDateString();

  if (period === "month") {
    return date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth();
  }

  const days = period === "7d" ? 7 : 30;
  const msAgo = now.getTime() - date.getTime();
  return msAgo >= 0 && msAgo <= days * 24 * 60 * 60 * 1000;
}

function aggregateProducts(orders: OrderWithDetails[]) {
  const totals = new Map<string, number>();
  for (const order of orders) {
    if (order.status !== "completed") continue;
    for (const item of order.order_items) {
      totals.set(item.product_name, (totals.get(item.product_name) ?? 0) + item.quantity);
    }
  }
  return Array.from(totals.entries())
    .map(([name, quantity]) => ({ name, quantity }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 6);
}

function buildWeeklyTrend(orders: OrderWithDetails[]) {
  const days: { key: string; label: string; count: number; isToday: boolean }[] = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = TREND_DAYS - 1; i >= 0; i--) {
    const day = new Date(today);
    day.setDate(today.getDate() - i);
    days.push({
      key: day.toDateString(),
      label: DAY_LABELS[day.getDay()]!,
      count: 0,
      isToday: i === 0,
    });
  }

  const dayIndex = new Map(days.map((d, idx) => [d.key, idx]));
  for (const order of orders) {
    if (order.status !== "completed") continue;
    const key = orderReferenceDate(order).toDateString();
    const idx = dayIndex.get(key);
    if (idx !== undefined) days[idx]!.count += 1;
  }

  return days;
}

export default function ReportsScreen() {
  const { profile } = useAuth();
  const isWaiter = profile?.role === "waiter";
  const [period, setPeriod] = useState<Period>("30d");

  const { data, loading, error, refreshing, refetch } = useAsyncData(
    () => (isWaiter ? loadWaiterOrders() : loadEmployeeOrders()),
    [isWaiter]
  );

  const allOrders = data?.orders ?? [];
  const filteredOrders = useMemo(() => allOrders.filter((o) => isWithinPeriod(o, period)), [allOrders, period]);

  const completedCount = useMemo(
    () => filteredOrders.filter((o) => o.status === "completed").length,
    [filteredOrders]
  );
  const cancelledCount = useMemo(
    () => filteredOrders.filter((o) => o.status === "cancelled").length,
    [filteredOrders]
  );
  const itemsSoldCount = useMemo(
    () =>
      filteredOrders
        .filter((o) => o.status === "completed")
        .reduce((sum, o) => sum + o.order_items.reduce((s, item) => s + item.quantity, 0), 0),
    [filteredOrders]
  );
  const products = useMemo(() => aggregateProducts(filteredOrders), [filteredOrders]);
  const maxProductQuantity = products[0]?.quantity ?? 1;
  const weeklyTrend = useMemo(() => buildWeeklyTrend(allOrders), [allOrders]);
  const maxTrendCount = Math.max(1, ...weeklyTrend.map((d) => d.count));

  if (!profile) return null;
  const fallbackHref = profile.role === "waiter" ? "/(waiter)" : "/(employee)";

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => safeGoBack(fallbackHref)} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Raporlarım</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetch} tintColor={colors.primary} />}
        >
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.periodRow}
          >
            {PERIOD_OPTIONS.map((option) => {
              const active = option.key === period;
              return (
                <Pressable
                  key={option.key}
                  style={[styles.periodChip, active && styles.periodChipActive]}
                  onPress={() => setPeriod(option.key)}
                >
                  <Text style={[styles.periodChipText, active && styles.periodChipTextActive]}>{option.label}</Text>
                </Pressable>
              );
            })}
          </ScrollView>

          <View style={styles.statGrid}>
            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: colors.tertiaryContainerBg }]}>
                <MaterialIcons name="schedule" size={18} color={colors.tertiaryContainerText} />
              </View>
              <Text style={styles.statValue}>{data?.pendingCount ?? 0}</Text>
              <Text style={styles.statLabel}>{isWaiter ? "Bekleyen Sipariş" : "Aktif Siparişiniz"}</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: colors.successContainer }]}>
                <MaterialIcons name="check-circle" size={18} color={colors.success} />
              </View>
              <Text style={styles.statValue}>{completedCount}</Text>
              <Text style={styles.statLabel}>Tamamlanan</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: colors.errorContainer }]}>
                <MaterialIcons name="cancel" size={18} color={colors.error} />
              </View>
              <Text style={styles.statValue}>{cancelledCount}</Text>
              <Text style={styles.statLabel}>İptal Edilen</Text>
            </View>

            <View style={styles.statCard}>
              <View style={[styles.statIconCircle, { backgroundColor: colors.secondaryContainer }]}>
                <MaterialIcons name="local-cafe" size={18} color={colors.secondary} />
              </View>
              <Text style={styles.statValue}>{itemsSoldCount}</Text>
              <Text style={styles.statLabel}>Satılan Ürün (Adet)</Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Haftalık Trend</Text>
            <View style={styles.trendCard}>
              <View style={styles.trendBars}>
                {weeklyTrend.map((day) => {
                  const barHeight =
                    day.count === 0 ? 4 : Math.max(6, (day.count / maxTrendCount) * TREND_BAR_MAX_HEIGHT);
                  return (
                    <View key={day.key} style={styles.trendBarColumn}>
                      <Text style={styles.trendBarCount}>{day.count > 0 ? day.count : ""}</Text>
                      <View style={styles.trendBarTrack}>
                        <View
                          style={[
                            styles.trendBarFill,
                            { height: barHeight },
                            day.isToday && styles.trendBarFillToday,
                          ]}
                        />
                      </View>
                      <Text style={[styles.trendBarLabel, day.isToday && styles.trendBarLabelToday]}>
                        {day.label}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={styles.sectionTitle}>Ürün Özeti</Text>
              <Text style={styles.sectionSubtitle}>{completedCount} onaylı sipariş</Text>
            </View>
            {products.length === 0 ? (
              <EmptyState icon="bar-chart" title="Bu dönemde ürün verisi yok" />
            ) : (
              <View style={styles.card}>
                {products.map((product, index) => (
                  <View
                    key={product.name}
                    style={[styles.productRow, index !== products.length - 1 && styles.productRowDivider]}
                  >
                    <View style={styles.rankBadge}>
                      <Text style={styles.rankBadgeText}>{index + 1}</Text>
                    </View>
                    <View style={styles.productInfo}>
                      <View style={styles.productTopRow}>
                        <Text style={styles.productName} numberOfLines={1}>
                          {product.name}
                        </Text>
                        <Text style={styles.productQuantityText}>{product.quantity} Adet</Text>
                      </View>
                      <View style={styles.productBarTrack}>
                        <View
                          style={[
                            styles.productBarFill,
                            { width: `${Math.max(6, (product.quantity / maxProductQuantity) * 100)}%` },
                          ]}
                        />
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </View>
        </ScrollView>
      )}
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  periodRow: {
    gap: spacing.sm,
    paddingRight: spacing.md,
  },
  periodChip: {
    paddingHorizontal: spacing.md,
    height: 38,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainer,
  },
  periodChipActive: {
    backgroundColor: colors.accent,
  },
  periodChipText: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    textTransform: "none",
    letterSpacing: 0,
  },
  periodChipTextActive: {
    color: "#ffffff",
  },
  statGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.md,
  },
  statCard: {
    flexBasis: "47%",
    flexGrow: 1,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  statIconCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  statValue: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  statLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  section: {
    gap: spacing.md,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "baseline",
    justifyContent: "space-between",
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  sectionSubtitle: {
    ...typography.labelMd,
    color: colors.outline,
  },
  trendCard: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  trendBars: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  trendBarColumn: {
    alignItems: "center",
    gap: 4,
    flex: 1,
  },
  trendBarCount: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    height: 14,
  },
  trendBarTrack: {
    width: 20,
    height: TREND_BAR_MAX_HEIGHT,
    justifyContent: "flex-end",
  },
  trendBarFill: {
    width: "100%",
    borderRadius: radius.sm,
    backgroundColor: colors.primaryFixed,
  },
  trendBarFillToday: {
    backgroundColor: colors.primary,
  },
  trendBarLabel: {
    ...typography.labelMd,
    color: colors.outline,
  },
  trendBarLabelToday: {
    color: colors.primary,
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.sm,
    paddingHorizontal: spacing.md,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm + 2,
  },
  productRowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  rankBadge: {
    width: 26,
    height: 26,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  rankBadgeText: {
    ...typography.labelLg,
    color: colors.primary,
  },
  productInfo: {
    flex: 1,
    gap: 6,
  },
  productTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
  },
  productName: {
    flex: 1,
    ...typography.bodyLg,
    fontWeight: "600",
    color: colors.onSurface,
  },
  productQuantityText: {
    ...typography.labelLg,
    color: colors.primary,
    textTransform: "none",
    letterSpacing: 0,
  },
  productBarTrack: {
    height: 6,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    overflow: "hidden",
  },
  productBarFill: {
    height: "100%",
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
