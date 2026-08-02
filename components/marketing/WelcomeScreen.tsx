import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { AnimatedFadeIn } from "@/components/ui/AnimatedFadeIn";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useIsWideWeb } from "@/hooks/useIsWideWeb";
import { colors, radius, spacing, typography, webShell } from "@/constants/theme";

const FEATURES: { icon: React.ComponentProps<typeof MaterialIcons>["name"]; label: string }[] = [
  { icon: "local-cafe", label: "Tek dokunuşla çay, kahve, ikram siparişi" },
  { icon: "notifications-active", label: "Anlık bildirimle görevliye ulaşan siparişler" },
  { icon: "bar-chart", label: "Raporlar ve sipariş geçmişiyle kurumsal takip" },
];

/** `/` adresine web'de oturumsuz gelen ziyaretçiye gösterilen kısa tanıtım — native/oturumluysa hiç render edilmez. */
export function WelcomeScreen() {
  const isWideWeb = useIsWideWeb();

  return (
    <ScreenContainer background="vivid">
      <ScrollView contentContainerStyle={[styles.scrollContent, isWideWeb && styles.scrollContentWide]}>
        <AnimatedFadeIn offsetY={12}>
          <View style={styles.header}>
            <AnimatedLogo icon="restaurant" size={72} />
            <Text style={styles.title}>OfisNow</Text>
            <Text style={styles.subtitle}>Ofis içi çay, kahve ve ikram sipariş sistemi</Text>
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={100} offsetY={10}>
          <View style={styles.featureList}>
            {FEATURES.map((feature) => (
              <View key={feature.label} style={styles.featureRow}>
                <View style={styles.featureIconCircle}>
                  <MaterialIcons name={feature.icon} size={18} color={colors.primary} />
                </View>
                <Text style={styles.featureText}>{feature.label}</Text>
              </View>
            ))}
          </View>
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={180} offsetY={10} style={styles.ctaGroup}>
          <Button label="Giriş Yap" onPress={() => router.push("/login")} />
          <Button label="Kayıt Ol" onPress={() => router.push("/register")} variant="outline" />
        </AnimatedFadeIn>

        <AnimatedFadeIn delay={240} offsetY={10}>
          <View style={styles.footer}>
            <Pressable onPress={() => router.push("/gizlilik-politikasi")} hitSlop={8}>
              <Text style={styles.footerLink}>Gizlilik Politikası</Text>
            </Pressable>
            <Text style={styles.footerDot}>·</Text>
            <Pressable onPress={() => router.push("/yardim-destek")} hitSlop={8}>
              <Text style={styles.footerLink}>Yardım</Text>
            </Pressable>
          </View>
        </AnimatedFadeIn>
      </ScrollView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.xl,
  },
  scrollContentWide: {
    width: "100%",
    maxWidth: webShell.maxWidth,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    gap: spacing.sm,
  },
  title: {
    ...typography.display,
    color: colors.primary,
  },
  subtitle: {
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  featureList: {
    gap: spacing.md,
  },
  featureRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  featureIconCircle: {
    width: 34,
    height: 34,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  featureText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  ctaGroup: {
    gap: spacing.md,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
  },
  footerLink: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  footerDot: {
    color: colors.outline,
  },
});
