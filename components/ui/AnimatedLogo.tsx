import { useEffect, useRef } from "react";
import type { ComponentProps } from "react";
import { Animated, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialIcons } from "@expo/vector-icons";

import { colors } from "@/constants/theme";

type IconName = ComponentProps<typeof MaterialIcons>["name"];

interface AnimatedLogoProps {
  icon: IconName;
  size?: number;
}

export function AnimatedLogo({ icon, size = 64 }: AnimatedLogoProps) {
  const pulse = useRef(new Animated.Value(0)).current;
  const spin = useRef(new Animated.Value(0)).current;
  const bob = useRef(new Animated.Value(0)).current;
  const entrance = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const pulseLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    const spinLoop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 3600,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    const bobLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bob, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(bob, {
          toValue: 0,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    const entranceSpring = Animated.spring(entrance, {
      toValue: 1,
      speed: 10,
      bounciness: 14,
      useNativeDriver: true,
    });
    entranceSpring.start();
    pulseLoop.start();
    spinLoop.start();
    bobLoop.start();
    return () => {
      pulseLoop.stop();
      spinLoop.stop();
      bobLoop.stop();
      entranceSpring.stop();
    };
  }, [bob, entrance, pulse, spin]);

  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.25, 0.55] });
  const ringOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.4, 0.9] });
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });
  const bobY = bob.interpolate({ inputRange: [0, 1], outputRange: [0, -6] });
  const entranceScale = entrance.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] });
  const entranceRotate = entrance.interpolate({ inputRange: [0, 1], outputRange: ["-35deg", "0deg"] });

  const ringSize = size + 20;
  const glowSize = size * 1.7;

  return (
    <Animated.View
      style={[
        styles.wrapper,
        {
          width: glowSize,
          height: glowSize,
          transform: [{ translateY: bobY }, { scale: entranceScale }, { rotate: entranceRotate }],
        },
      ]}
    >
      <Animated.View
        style={[
          styles.glow,
          { width: glowSize, height: glowSize, borderRadius: glowSize / 2, opacity: glowOpacity, transform: [{ scale }] },
        ]}
      >
        <LinearGradient
          colors={[colors.primaryLight, "transparent"]}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      <Animated.View
        style={[
          styles.ring,
          {
            width: ringSize,
            height: ringSize,
            borderRadius: ringSize / 2,
            opacity: ringOpacity,
            transform: [{ rotate }],
          },
        ]}
      />
      <Animated.View
        style={[
          styles.circle,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            transform: [{ scale }],
          },
        ]}
      >
        <MaterialIcons name={icon} size={size * 0.5} color="#ffffff" />
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    justifyContent: "center",
  },
  glow: {
    position: "absolute",
    overflow: "hidden",
  },
  ring: {
    position: "absolute",
    borderWidth: 2,
    borderColor: colors.primaryLight,
    borderStyle: "dashed",
    borderTopColor: colors.primary,
  },
  circle: {
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
});
