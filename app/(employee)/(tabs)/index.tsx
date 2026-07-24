import { useCallback, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useFocusEffect } from "expo-router";
import { setStatusBarStyle } from "expo-status-bar";
import { Pressable, RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CategoryCard } from "@/components/employee/CategoryCard";
import { EmployeeOrderCard } from "@/components/employee/EmployeeOrderCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { ScreenHero } from "@/components/ui/ScreenHero";
import { useAuth } from "@/context/AuthContext";
import { fetchCategories } from "@/lib/api/catalog";
import { callWaiter, fetchMyActiveOrders, fetchMyOrderHistory, requestPickup } from "@/lib/api/orders";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useOrdersRealtime } from "@/hooks/useOrdersRealtime";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";

export default function EmployeeHomeScreen() {
  const { profile } = useAuth();
  const insets = useSafeAreaInsets();
  const [calling, setCalling] = useState(false);
  const [requestingPickup, setRequestingPickup] = useState(false);

  const categories = useAsyncData(fetchCategories, []);
  const activeOrders = useAsyncData(fetchMyActiveOrders, []);
  const recentOrders = useAsyncData(() => fetchMyOrderHistory(3), []);

  const refreshAll = useCallback(() => {
    categories.refetch();
    activeOrders.refetch();
    recentOrders.refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useOrdersRealtime(
    useCallback(() => {
      activeOrders.refetch();
      recentOrders.refetch();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])
  );

  const isRefreshing = activeOrders.refreshing || categories.refreshing || recentOrders.refreshing;
  const activeCount = (activeOrders.data ?? []).length;

  useFocusEffect(
    useCallback(() => {
      setStatusBarStyle("light");
      return () => setStatusBarStyle("dark");
    }, [])
  );

  function handleCallWaiter() {
    showAlert("Görevli Çağır", "Görevliyi şu anki konumunuza çağırmak istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çağır",
        onPress: async () => {
          setCalling(true);
          try {
            await callWaiter(null);
            activeOrders.refetch();
            showAlert("Görevli çağrıldı", "Görevlilere bildirim gönderildi.");
          } catch (err) {
            showAlert("Hata", toFriendlyErrorMessage(err));
          } finally {
            setCalling(false);
          }
        },
      },
    ]);
  }

  function handleRequestPickup() {
    showAlert(
      "Boşları Alır mısınız?",
      "Masanızdaki boş bardak/tabakları toplaması için görevliye nazikçe bir rica gönderelim mi? Acil değil, uygun olduğunda gelir.",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Rica Gönder",
          onPress: async () => {
            setRequestingPickup(true);
            try {
              await requestPickup(null);
              activeOrders.refetch();
              showAlert("Rica gönderildi", "Görevlimiz uygun olduğunda gelip boşları alacak. Teşekkürler!");
            } catch (err) {
              showAlert("Hata", toFriendlyErrorMessage(err));
            } finally {
              setRequestingPickup(false);
            }
          },
        },
      ]
    );
  }

  return (
    <ScreenContainer edges={["left", "right"]} style={styles.screen}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={refreshAll} tintColor={colors.primary} />}
      >
        <ScreenHero
          title={`Merhaba ${profile?.full_name?.split(" ")[0] ?? ""} 👋`}
          subtitle="Ne sipariş etmek istersiniz?"
          topInset={insets.top}
          chip={
            activeCount > 0
              ? {
                  icon: "schedule",
                  label: `${activeCount} aktif siparişiniz var`,
                  onPress: () => router.push("/(employee)/siparislerim"),
                }
              : undefined
          }
        />

        <Pressable
          style={({ pressed }) => [styles.callWaiterButton, calling && styles.callWaiterButtonDisabled, pressed && !calling && styles.callWaiterButtonPressed]}
          onPress={handleCallWaiter}
          disabled={calling}
        >
          <View style={styles.callWaiterIconCircle}>
            <MaterialIcons name="notifications-active" size={20} color="#ffffff" />
          </View>
          <Text style={styles.callWaiterText}>{calling ? "Çağrılıyor..." : "Görevli Çağır"}</Text>
        </Pressable>

        <Pressable
          style={({ pressed }) => [
            styles.pickupButton,
            requestingPickup && styles.pickupButtonDisabled,
            pressed && !requestingPickup && styles.pickupButtonPressed,
          ]}
          onPress={handleRequestPickup}
          disabled={requestingPickup}
        >
          <MaterialIcons name="cleaning-services" size={18} color={colors.secondary} />
          <Text style={styles.pickupButtonText}>
            {requestingPickup ? "Rica gönderiliyor..." : "Boşları Alır mısınız?"}
          </Text>
        </Pressable>

        <View style={styles.body}>
          <View style={styles.categoryGrid}>
            {(categories.data ?? []).map((category, idx) => (
              <CategoryCard
                key={category.id}
                name={category.name}
                index={idx}
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
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  screen: {
    backgroundColor: colors.background,
  },
  content: {
    paddingBottom: 140,
  },
  callWaiterButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: -spacing.lg,
    height: 64,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.accent,
    ...shadows.lg,
    shadowColor: colors.accentDark,
  },
  callWaiterButtonPressed: {
    opacity: 0.92,
  },
  callWaiterButtonDisabled: {
    opacity: 0.6,
  },
  callWaiterIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.22)",
    alignItems: "center",
    justifyContent: "center",
  },
  callWaiterText: {
    ...typography.headlineSm,
    color: "#ffffff",
  },
  pickupButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    height: 44,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.secondaryContainer,
    backgroundColor: colors.surfaceContainerLowest,
  },
  pickupButtonPressed: {
    opacity: 0.85,
  },
  pickupButtonDisabled: {
    opacity: 0.6,
  },
  pickupButtonText: {
    ...typography.bodyMd,
    fontWeight: "600",
    color: colors.secondary,
  },
  body: {
    padding: spacing.md,
    gap: spacing.lg,
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
