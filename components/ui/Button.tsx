import { useRef } from "react";
import { ActivityIndicator, Animated, Pressable, StyleSheet, Text, View } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

import { colors, radius, shadows, spacing, typography } from "@/constants/theme";

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: "primary" | "secondary" | "accent" | "outline" | "danger";
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}

export function Button({
  label,
  onPress,
  variant = "primary",
  disabled,
  loading,
  icon,
  style,
}: ButtonProps) {
  const isDisabled = disabled || loading;
  const press = useRef(new Animated.Value(0)).current;

  function animateTo(toValue: number) {
    Animated.spring(press, { toValue, speed: 40, bounciness: 10, useNativeDriver: true }).start();
  }

  const scale = press.interpolate({ inputRange: [0, 1], outputRange: [1, 0.95] });

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      onPress={onPress}
      onPressIn={() => !isDisabled && animateTo(1)}
      onPressOut={() => animateTo(0)}
      disabled={isDisabled}
    >
      <Animated.View
        style={[
          styles.base,
          variant !== "outline" && !isDisabled && styles.elevated,
          variantStyles[variant],
          isDisabled && styles.disabled,
          { transform: [{ scale }] },
          style,
        ]}
      >
        {loading ? (
          <ActivityIndicator color={variant === "outline" ? colors.primary : "#ffffff"} />
        ) : (
          <View style={styles.content}>
            {icon}
            <Text style={[styles.label, variant === "outline" && styles.labelOutline]}>{label}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: spacing.lg,
  },
  elevated: {
    ...shadows.md,
  },
  content: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  label: {
    ...typography.headlineSm,
    color: "#ffffff",
  },
  labelOutline: {
    color: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary, shadowColor: colors.primary },
  secondary: { backgroundColor: colors.secondary, shadowColor: colors.secondary },
  accent: { backgroundColor: colors.accent, shadowColor: colors.accent },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  danger: { backgroundColor: colors.error, shadowColor: colors.error },
});
