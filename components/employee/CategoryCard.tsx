import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { categoryColor, categoryIcon } from "@/constants/categoryIcons";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";

export function CategoryCard({
  name,
  index = 0,
  onPress,
}: {
  name: string;
  index?: number;
  onPress: () => void;
}) {
  const { bg, fg } = categoryColor(index);

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={[styles.iconCircle, { backgroundColor: bg }]}>
        <MaterialIcons name={categoryIcon(name)} size={26} color={fg} />
      </View>
      <Text style={styles.name} numberOfLines={2}>
        {name}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    height: 132,
    justifyContent: "space-between",
    ...shadows.sm,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    ...typography.labelLg,
    color: colors.onSurface,
    textTransform: "none",
    letterSpacing: 0,
    fontSize: 14,
  },
});
