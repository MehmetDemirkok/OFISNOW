import { forwardRef, useEffect, useRef, useState } from "react";
import type { ComponentProps, ReactNode } from "react";
import { Animated, StyleSheet, TextInput, View } from "react-native";
import type { TextInputProps } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { colors, radius, spacing, typography } from "@/constants/theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

const SINGLE_HEIGHT = 56;
const MULTILINE_HEIGHT = 88;
const FLOATED_TRANSLATE_Y = -20;
// The floated label moves above the box via transform, which reserves no layout
// space on its own. Every real usage already sits in a gap:16 (spacing.md)
// container, so this only needs to top that up enough to clear the label.
const LABEL_CLEARANCE = 8;

interface AnimatedTextFieldProps extends Omit<TextInputProps, "style"> {
  label: string;
  icon: IconName;
  rightElement?: ReactNode;
  multiline?: boolean;
}

export const AnimatedTextField = forwardRef<TextInput, AnimatedTextFieldProps>(function AnimatedTextField(
  { label, icon, rightElement, multiline, value, placeholder, onFocus, onBlur, ...inputProps },
  ref
) {
  const hasValue = Boolean(value && String(value).length > 0);
  const [isFocused, setIsFocused] = useState(false);
  const focus = useRef(new Animated.Value(0)).current;
  const float = useRef(new Animated.Value(hasValue ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(focus, {
      toValue: isFocused ? 1 : 0,
      useNativeDriver: false,
      speed: 20,
      bounciness: 6,
    }).start();
  }, [isFocused, focus]);

  useEffect(() => {
    Animated.timing(float, {
      toValue: isFocused || hasValue ? 1 : 0,
      duration: 170,
      useNativeDriver: false,
    }).start();
  }, [isFocused, hasValue, float]);

  const borderColor = focus.interpolate({ inputRange: [0, 1], outputRange: [colors.outlineVariant, colors.primary] });
  const scale = focus.interpolate({ inputRange: [0, 1], outputRange: [1, 1.015] });
  const shadowOpacity = focus.interpolate({ inputRange: [0, 1], outputRange: [0, 0.18] });

  // The label sits inside the same box as the TextInput (fieldSlot), which the
  // wrapper row already centers/aligns for us - so "resting" is translateY 0,
  // exactly overlapping where the input's own text sits.
  const labelTranslateY = float.interpolate({
    inputRange: [0, 1],
    outputRange: [0, FLOATED_TRANSLATE_Y],
  });
  const labelFontSize = float.interpolate({ inputRange: [0, 1], outputRange: [16, 12] });
  const labelLineHeight = float.interpolate({ inputRange: [0, 1], outputRange: [24, 16] });
  const labelColor = float.interpolate({
    inputRange: [0, 1],
    outputRange: [colors.outline, colors.onSurfaceVariant],
  });

  const showPlaceholder = isFocused || hasValue;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        multiline && styles.wrapperMultiline,
        {
          borderColor,
          shadowColor: colors.primary,
          shadowOpacity,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 3 },
          transform: [{ scale }],
        },
      ]}
    >
      <MaterialIcons
        name={icon}
        size={20}
        color={isFocused ? colors.primary : colors.outline}
        style={multiline ? styles.iconMultiline : undefined}
      />
      {/* Label and input share this one box so they're always aligned identically -
          no need to reason about the icon's rendered width. */}
      <View style={styles.fieldSlot}>
        <Animated.Text
          style={[
            styles.label,
            {
              fontSize: labelFontSize,
              lineHeight: labelLineHeight,
              color: labelColor,
              transform: [{ translateY: labelTranslateY }],
            },
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
          pointerEvents="none"
        >
          {label}
        </Animated.Text>
        <TextInput
          {...inputProps}
          ref={ref}
          style={[styles.input, multiline && styles.inputMultiline]}
          value={value}
          placeholder={showPlaceholder ? placeholder : undefined}
          placeholderTextColor={colors.outline}
          multiline={multiline}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
        />
      </View>
      {rightElement}
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: SINGLE_HEIGHT,
    marginTop: LABEL_CLEARANCE,
  },
  wrapperMultiline: {
    height: MULTILINE_HEIGHT,
    alignItems: "flex-start",
    paddingVertical: spacing.sm,
  },
  iconMultiline: {
    marginTop: 2,
  },
  fieldSlot: {
    flex: 1,
    position: "relative",
  },
  label: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    ...typography.bodyLg,
  },
  input: {
    ...typography.bodyLg,
    color: colors.onSurface,
    paddingVertical: 0,
  },
  inputMultiline: {
    textAlignVertical: "top",
    paddingTop: 2,
  },
});
