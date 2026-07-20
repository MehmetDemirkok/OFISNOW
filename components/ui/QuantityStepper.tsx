import { MaterialIcons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, typography } from "@/constants/theme";

interface QuantityStepperProps {
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function QuantityStepper({ quantity, onIncrement, onDecrement }: QuantityStepperProps) {
  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adedi azalt"
        onPress={onDecrement}
        disabled={quantity === 0}
        style={({ pressed }) => [
          styles.button,
          styles.buttonMuted,
          pressed && styles.pressed,
          quantity === 0 && styles.disabled,
        ]}
      >
        <MaterialIcons name="remove" size={20} color={colors.onSurface} />
      </Pressable>
      <Text style={styles.quantity}>{quantity}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Adedi artır"
        onPress={onIncrement}
        style={({ pressed }) => [styles.button, styles.buttonPrimary, pressed && styles.pressed]}
      >
        <MaterialIcons name="add" size={20} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: 4,
  },
  button: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonMuted: {
    backgroundColor: "transparent",
  },
  buttonPrimary: {
    backgroundColor: colors.primary,
  },
  pressed: {
    opacity: 0.8,
  },
  disabled: {
    opacity: 0.3,
  },
  quantity: {
    ...typography.headlineSm,
    color: colors.onSurface,
    width: 36,
    textAlign: "center",
  },
});
