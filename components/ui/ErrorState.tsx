import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { colors, radius, spacing, typography } from "@/constants/theme";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <View style={styles.iconCircle}>
        <MaterialIcons name="error-outline" size={36} color={colors.error} />
      </View>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? <Button label="Tekrar Dene" onPress={onRetry} variant="outline" /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.lg,
  },
  iconCircle: {
    width: 72,
    height: 72,
    borderRadius: radius.full,
    backgroundColor: colors.errorContainer,
    alignItems: "center",
    justifyContent: "center",
  },
  message: {
    ...typography.bodyLg,
    color: colors.onSurface,
    textAlign: "center",
  },
});
