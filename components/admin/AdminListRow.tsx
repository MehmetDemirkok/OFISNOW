import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/constants/theme";

interface AdminListRowProps {
  title: string;
  subtitle?: string;
  isActive: boolean;
  onToggleActive: (value: boolean) => void;
  onEdit: () => void;
  onDelete?: () => void;
}

export function AdminListRow({ title, subtitle, isActive, onToggleActive, onEdit, onDelete }: AdminListRowProps) {
  return (
    <View style={[styles.row, !isActive && styles.rowInactive]}>
      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.actions}>
        <Switch
          value={isActive}
          onValueChange={onToggleActive}
          trackColor={{ false: colors.outlineVariant, true: colors.primary }}
        />
        <Pressable onPress={onEdit} hitSlop={10}>
          <MaterialIcons name="edit" size={22} color={colors.onSurfaceVariant} />
        </Pressable>
        {onDelete ? (
          <Pressable onPress={onDelete} hitSlop={10}>
            <MaterialIcons name="delete-outline" size={22} color={colors.error} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
  },
  rowInactive: {
    opacity: 0.6,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  title: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
});
