import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/constants/theme";

export function AdminScreenHeader({ title, onAdd }: { title: string; onAdd?: () => void }) {
  return (
    <View style={styles.header}>
      <Text style={styles.title} numberOfLines={1}>
        {title}
      </Text>
      {onAdd ? (
        <Pressable onPress={onAdd} style={styles.addButton}>
          <MaterialIcons name="add" size={20} color="#ffffff" />
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingLeft: spacing.md,
    // Sağ üstte tüm ekranlarda sabit duran hesap rozetiyle (AccountCorner)
    // çakışmaması için buton bu kadar içeriden başlar.
    paddingRight: 64,
    paddingVertical: spacing.sm,
  },
  title: {
    flex: 1,
    marginRight: spacing.sm,
    ...typography.headlineMd,
    color: colors.onSurface,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
});
