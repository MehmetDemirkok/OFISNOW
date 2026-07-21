import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Switch, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/constants/theme";
import type { LocationWithContacts } from "@/types/database";

const MAX_VISIBLE_CONTACTS = 4;

interface LocationCardProps {
  location: LocationWithContacts;
  onToggleActive: (value: boolean) => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function LocationCard({ location, onToggleActive, onEdit, onDelete }: LocationCardProps) {
  const contacts = location.contacts ?? [];
  const visibleContacts = contacts.slice(0, MAX_VISIBLE_CONTACTS);
  const overflowCount = contacts.length - visibleContacts.length;

  return (
    <Pressable
      onPress={onEdit}
      style={({ pressed }) => [styles.card, !location.is_active && styles.cardInactive, pressed && styles.cardPressed]}
    >
      <View style={styles.topRow}>
        <View style={styles.iconBadge}>
          <MaterialIcons name="place" size={20} color={colors.primary} />
        </View>

        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>
            {location.name}
          </Text>
          <Text style={styles.meta}>Sıra {location.sort_order}</Text>
        </View>

        <View style={styles.actions}>
          <Switch
            value={location.is_active}
            onValueChange={onToggleActive}
            trackColor={{ false: colors.outlineVariant, true: colors.primary }}
          />
          <Pressable onPress={onEdit} hitSlop={10} style={styles.editButton}>
            <MaterialIcons name="edit" size={20} color={colors.onSurfaceVariant} />
          </Pressable>
          <Pressable onPress={onDelete} hitSlop={10} style={styles.editButton}>
            <MaterialIcons name="delete-outline" size={20} color={colors.error} />
          </Pressable>
        </View>
      </View>

      <View style={styles.divider} />

      {contacts.length === 0 ? (
        <View style={styles.emptyContacts}>
          <MaterialIcons name="person-add-alt" size={16} color={colors.outline} />
          <Text style={styles.emptyContactsText}>Henüz kişi eklenmemiş</Text>
        </View>
      ) : (
        <View style={styles.chipRow}>
          {visibleContacts.map((contact) => (
            <View key={contact.id} style={styles.chip}>
              <MaterialIcons name="person" size={14} color={colors.onSecondaryContainer} />
              <Text style={styles.chipText} numberOfLines={1}>
                {contact.full_name}
              </Text>
            </View>
          ))}
          {overflowCount > 0 ? (
            <View style={[styles.chip, styles.chipMuted]}>
              <Text style={styles.chipMutedText}>+{overflowCount}</Text>
            </View>
          ) : null}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.sm,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardInactive: {
    opacity: 0.55,
  },
  cardPressed: {
    backgroundColor: colors.surfaceContainerLow,
  },
  topRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBadge: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  info: {
    flex: 1,
    gap: 2,
  },
  name: {
    ...typography.bodyLg,
    fontWeight: "600",
    color: colors.onSurface,
  },
  meta: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  editButton: {
    padding: spacing.xs,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.outlineVariant,
  },
  emptyContacts: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
  },
  emptyContactsText: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.xs,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: colors.secondaryContainer,
    borderRadius: radius.full,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    maxWidth: "100%",
  },
  chipText: {
    ...typography.labelMd,
    color: colors.onSecondaryContainer,
    fontWeight: "600",
  },
  chipMuted: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  chipMutedText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontWeight: "600",
  },
});
