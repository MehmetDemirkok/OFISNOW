import type { ComponentProps } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router, usePathname } from "expo-router";
import type { Href } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography, webShell } from "@/constants/theme";

export interface WebSidebarNavItem {
  href: Href;
  label: string;
  icon: ComponentProps<typeof MaterialIcons>["name"];
}

interface WebSidebarNavProps {
  items: WebSidebarNavItem[];
}

/** Rota gruplarını ("(employee)" gibi) atıp karşılaştırılabilir bir yol üretir. */
function stripGroups(path: string) {
  const cleaned = path.replace(/\/\([^/)]+\)/g, "");
  return cleaned === "" ? "/" : cleaned;
}

export function WebSidebarNav({ items }: WebSidebarNavProps) {
  const pathname = usePathname();
  const currentPath = stripGroups(pathname);

  return (
    <View style={styles.sidebar}>
      <View style={styles.brand}>
        <View style={styles.brandMark}>
          <MaterialIcons name="restaurant" size={20} color="#ffffff" />
        </View>
        <Text style={styles.brandLabel}>OfisNow</Text>
      </View>

      <View style={styles.items}>
        {items.map((item) => {
          const itemPath = stripGroups(typeof item.href === "string" ? item.href : String(item.href));
          const active = currentPath === itemPath;
          return (
            <Pressable
              key={itemPath}
              onPress={() => router.push(item.href)}
              style={({ pressed }) => [styles.item, active && styles.itemActive, pressed && styles.itemPressed]}
            >
              <MaterialIcons name={item.icon} size={22} color={active ? colors.primary : colors.onSurfaceVariant} />
              <Text style={[styles.itemLabel, active && styles.itemLabelActive]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sidebar: {
    width: webShell.sidebarWidth,
    borderRightWidth: 1,
    borderRightColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.sm,
    gap: spacing.lg,
  },
  brand: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
  },
  brandMark: {
    width: 34,
    height: 34,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  brandLabel: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  items: {
    gap: spacing.xs,
  },
  item: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.md,
  },
  itemPressed: {
    opacity: 0.85,
  },
  itemActive: {
    backgroundColor: colors.primaryFixed,
  },
  itemLabel: {
    ...typography.bodyMd,
    fontWeight: "600",
    color: colors.onSurfaceVariant,
  },
  itemLabelActive: {
    color: colors.primary,
  },
});
