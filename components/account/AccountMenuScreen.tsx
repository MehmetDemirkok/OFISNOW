import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import type { Href } from "expo-router";
import { router } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { showAlert } from "@/lib/alert";
import { getInitials } from "@/lib/initials";
import { colors, radius, roleLabels, shadows, spacing, typography } from "@/constants/theme";

interface MenuItem {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  onPress: () => void;
  iconColor: string;
  iconBg: string;
}

function MenuRow({ item, isLast }: { item: MenuItem; isLast: boolean }) {
  return (
    <Pressable
      style={({ pressed }) => [styles.row, !isLast && styles.rowDivider, pressed && styles.rowPressed]}
      onPress={item.onPress}
    >
      <View style={[styles.rowIconCircle, { backgroundColor: item.iconBg }]}>
        <MaterialIcons name={item.icon} size={20} color={item.iconColor} />
      </View>
      <Text style={styles.rowLabel}>{item.label}</Text>
      <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
    </Pressable>
  );
}

/**
 * "Hesabım" ekranı: hem çalışan hem görevli tarafında aynı tasarımla
 * kullanılır. Geçmiş sipariş rotası role göre değiştiği için dışarıdan alınır.
 */
export function AccountMenuScreen({ historyHref }: { historyHref: Href }) {
  const { profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();

  if (!profile) return null;

  const items: MenuItem[] = [
    {
      icon: "person",
      label: "Bilgilerim",
      onPress: () => router.push("/profile"),
      iconColor: colors.primary,
      iconBg: colors.primaryFixed,
    },
    {
      icon: "bar-chart",
      label: "Raporlarım",
      onPress: () => router.push("/raporlarim"),
      iconColor: colors.accentDark,
      iconBg: colors.accentContainer,
    },
    {
      icon: "history",
      label: "Geçmiş Siparişlerim",
      onPress: () => router.push(historyHref),
      iconColor: colors.onSecondaryContainer,
      iconBg: colors.secondaryContainer,
    },
    {
      icon: "support-agent",
      label: "Yardım ve Destek",
      onPress: () => router.push("/yardim-destek"),
      iconColor: colors.warning,
      iconBg: colors.warningContainer,
    },
    {
      icon: "feedback",
      label: "Geri Bildirim Gönder",
      onPress: () => router.push("/geri-bildirim"),
      iconColor: colors.success,
      iconBg: colors.successContainer,
    },
    {
      icon: "settings",
      label: "Hesap Ayarları",
      onPress: () => router.push("/hesap-ayarlari"),
      iconColor: colors.onSurfaceVariant,
      iconBg: colors.surfaceContainerHigh,
    },
  ];

  function handleSignOutPress() {
    showAlert("Çıkış Yap", "Hesabınızdan çıkış yapmak istediğinize emin misiniz?", [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Çıkış Yap",
        style: "destructive",
        onPress: async () => {
          await signOut();
          router.replace("/login");
        },
      },
    ]);
  }

  return (
    <ScreenContainer edges={["left", "right"]} style={styles.screen}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <LinearGradient
          colors={[colors.primary, colors.primaryDark]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.hero, { paddingTop: insets.top + spacing.md }]}
        >
          <View style={styles.blobLg} />
          <View style={styles.blobSm} />

          <Text style={styles.screenTitle}>Hesabım</Text>

          <View style={styles.profileHeader}>
            <View style={styles.avatarWrap}>
              {profile.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(profile.full_name)}</Text>
                </View>
              )}
              <View style={styles.verifiedBadge}>
                <MaterialIcons name="verified" size={16} color={colors.onSecondaryContainer} />
              </View>
            </View>
            <Text style={styles.name} numberOfLines={1}>
              {profile.full_name}
            </Text>
            <View style={styles.roleChip}>
              <Text style={styles.roleChipText}>
                {profile.job_title?.trim() || roleLabels[profile.role] || profile.role}
              </Text>
            </View>
          </View>
        </LinearGradient>

        <View style={styles.body}>
          <View style={styles.card}>
            {items.map((item, index) => (
              <MenuRow key={item.label} item={item} isLast={index === items.length - 1} />
            ))}
          </View>

          <Pressable
            style={({ pressed }) => [styles.signOutButton, pressed && styles.signOutButtonPressed]}
            onPress={handleSignOutPress}
          >
            <MaterialIcons name="logout" size={20} color={colors.error} />
            <Text style={styles.signOutText}>Çıkış Yap</Text>
          </Pressable>

          <Text style={styles.footerText}>OfisNow v1.0.0</Text>
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
  hero: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
    borderBottomLeftRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
    overflow: "hidden",
  },
  blobLg: {
    position: "absolute",
    width: 180,
    height: 180,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.08)",
    top: -60,
    right: -40,
  },
  blobSm: {
    position: "absolute",
    width: 90,
    height: 90,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.08)",
    bottom: -20,
    left: -20,
  },
  screenTitle: {
    ...typography.display,
    color: "#ffffff",
  },
  profileHeader: {
    alignItems: "center",
    gap: 2,
    marginTop: spacing.lg,
  },
  avatarWrap: {
    width: 88,
    height: 88,
    marginBottom: spacing.sm,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  avatarText: {
    ...typography.headlineLg,
    color: colors.primary,
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
    borderWidth: 3,
    borderColor: "rgba(255,255,255,0.5)",
  },
  verifiedBadge: {
    position: "absolute",
    right: -2,
    bottom: spacing.sm - 2,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.secondaryContainer,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.primaryDark,
  },
  name: {
    ...typography.headlineMd,
    color: "#ffffff",
    maxWidth: "100%",
  },
  roleChip: {
    marginTop: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.18)",
  },
  roleChipText: {
    ...typography.labelMd,
    color: "#ffffff",
    fontWeight: "700",
  },
  body: {
    padding: spacing.md,
    marginTop: -spacing.lg,
    gap: spacing.lg,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.md,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    height: 60,
  },
  rowDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  rowPressed: {
    backgroundColor: colors.surfaceContainerLow,
  },
  rowIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: {
    flex: 1,
    ...typography.bodyLg,
    fontWeight: "600",
    color: colors.onSurface,
  },
  signOutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    height: 52,
    marginTop: spacing.xs,
    borderRadius: radius.lg,
    borderWidth: 2,
    borderColor: colors.errorContainer,
    backgroundColor: colors.errorContainer,
  },
  signOutButtonPressed: {
    opacity: 0.85,
  },
  signOutText: {
    ...typography.bodyLg,
    fontWeight: "700",
    color: colors.error,
  },
  footerText: {
    ...typography.labelMd,
    color: colors.outline,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
