import { MaterialIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/constants/theme";

interface ScreenHeroChip {
  icon: React.ComponentProps<typeof MaterialIcons>["name"];
  label: string;
  onPress?: () => void;
}

interface ScreenHeroProps {
  title: string;
  subtitle?: string;
  topInset: number;
  chip?: ScreenHeroChip;
  children?: React.ReactNode;
}

/**
 * Çalışan ana sayfası için tasarlanan degrade "hero" başlık; tüm rollerin
 * ana ekranlarında aynı temayı kullanmak için buradan paylaşılır.
 */
export function ScreenHero({ title, subtitle, topInset, chip, children }: ScreenHeroProps) {
  return (
    <LinearGradient
      colors={[colors.primary, colors.primaryDark]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.hero, { paddingTop: topInset + spacing.md }]}
    >
      <View style={styles.blobLg} />
      <View style={styles.blobSm} />
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}

      {chip ? (
        <Pressable style={styles.chip} onPress={chip.onPress} disabled={!chip.onPress}>
          <MaterialIcons name={chip.icon} size={16} color="#ffffff" />
          <Text style={styles.chipText}>{chip.label}</Text>
          {chip.onPress ? <MaterialIcons name="chevron-right" size={16} color="#ffffff" /> : null}
        </Pressable>
      ) : null}

      {children}
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  hero: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl + spacing.lg,
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
  title: {
    ...typography.display,
    color: "#ffffff",
    paddingRight: 48,
  },
  subtitle: {
    ...typography.bodyLg,
    color: "rgba(255,255,255,0.85)",
    marginTop: 4,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: spacing.xs,
    marginTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  chipText: {
    ...typography.labelLg,
    color: "#ffffff",
    textTransform: "none",
    letterSpacing: 0,
  },
});
