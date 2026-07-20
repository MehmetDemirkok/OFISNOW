import { MaterialIcons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { colors, spacing, typography } from "@/constants/theme";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <View style={styles.container}>
      <MaterialIcons name="error-outline" size={48} color={colors.error} />
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
  message: {
    ...typography.bodyLg,
    color: colors.onSurface,
    textAlign: "center",
  },
});
