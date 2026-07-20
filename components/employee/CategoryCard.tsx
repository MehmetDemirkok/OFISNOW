import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { categoryIcon } from "@/constants/categoryIcons";
import { colors, radius, spacing, typography } from "@/constants/theme";

export function CategoryCard({ name, onPress }: { name: string; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.iconCircle}>
        <MaterialIcons name={categoryIcon(name)} size={26} color={colors.primary} />
      </View>
      <Text style={styles.name}>{name}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
    height: 128,
    justifyContent: "space-between",
  },
  pressed: {
    opacity: 0.85,
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    ...typography.labelLg,
    color: colors.onSurface,
    textTransform: "none",
    letterSpacing: 0,
  },
});
