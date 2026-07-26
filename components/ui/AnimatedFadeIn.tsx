import { useEffect, useRef } from "react";
import type { ReactNode } from "react";
import { Animated, Easing } from "react-native";
import type { StyleProp, ViewStyle } from "react-native";

interface AnimatedFadeInProps {
  children: ReactNode;
  delay?: number;
  offsetY?: number;
  style?: StyleProp<ViewStyle>;
}

export function AnimatedFadeIn({ children, delay = 0, offsetY = 16, style }: AnimatedFadeInProps) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: 420,
      delay,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    });
    animation.start();
    return () => animation.stop();
  }, [delay, progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [offsetY, 0] }),
            },
          ],
        },
      ]}
    >
      {children}
    </Animated.View>
  );
}
