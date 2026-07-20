import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { colors, radius, spacing, typography } from "@/constants/theme";
import type { Location } from "@/types/database";

const OTHER_VALUE = "__other__";

interface LocationPickerProps {
  locations: Location[];
  selectedId: string | null;
  customText: string;
  onSelect: (id: string | null) => void;
  onCustomTextChange: (text: string) => void;
}

export function LocationPicker({
  locations,
  selectedId,
  customText,
  onSelect,
  onCustomTextChange,
}: LocationPickerProps) {
  const isOther = selectedId === OTHER_VALUE;

  return (
    <View style={styles.container}>
      {locations.map((location) => {
        const isSelected = selectedId === location.id;
        return (
          <Pressable
            key={location.id}
            onPress={() => onSelect(location.id)}
            style={({ pressed }) => [
              styles.row,
              isSelected && styles.rowSelected,
              pressed && styles.pressed,
            ]}
          >
            <MaterialIcons
              name={isSelected ? "radio-button-checked" : "radio-button-unchecked"}
              size={20}
              color={isSelected ? colors.primary : colors.outline}
            />
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{location.name}</Text>
          </Pressable>
        );
      })}

      <Pressable
        onPress={() => onSelect(OTHER_VALUE)}
        style={({ pressed }) => [styles.row, isOther && styles.rowSelected, pressed && styles.pressed]}
      >
        <MaterialIcons
          name={isOther ? "radio-button-checked" : "radio-button-unchecked"}
          size={20}
          color={isOther ? colors.primary : colors.outline}
        />
        <Text style={[styles.label, isOther && styles.labelSelected]}>Diğer</Text>
      </Pressable>

      {isOther ? (
        <TextInput
          style={styles.input}
          value={customText}
          onChangeText={onCustomTextChange}
          placeholder="Örn: 3. Kat Sohbet Odası"
          placeholderTextColor={colors.outline}
        />
      ) : null}
    </View>
  );
}

export { OTHER_VALUE };

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  rowSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryFixed,
  },
  pressed: {
    opacity: 0.85,
  },
  label: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  labelSelected: {
    fontWeight: "600",
  },
  input: {
    marginTop: spacing.xs,
    height: 48,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
});
