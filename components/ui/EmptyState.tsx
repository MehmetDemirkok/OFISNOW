import { MaterialIcons } from "@expo/vector-icons";
import type { ComponentProps } from "react";
import { StyleSheet, Text, View } from "react-native";

import { colors, spacing, typography } from "@/constants/theme";

interface EmptyStateProps {
  icon?: ComponentProps<typeof MaterialIcons>["name"];
  title: string;
  description?: string;
}

export function EmptyState({ icon = "inbox", title, description }: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name={icon} size={40} color={colors.outline} />
      <Text style={styles.title}>{title}</Text>
      {description ? <Text style={styles.description}>{description}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    padding: spacing.xl,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurfaceVariant,
    textAlign: "center",
  },
  description: {
    ...typography.bodyMd,
    color: colors.outline,
    textAlign: "center",
  },
});
