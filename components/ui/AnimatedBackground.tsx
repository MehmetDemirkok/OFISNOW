import { useEffect, useMemo, useRef } from "react";
import { Animated, Dimensions, Easing, StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import { colors } from "@/constants/theme";

export type BackgroundIntensity = "subtle" | "vivid";

interface BlobConfig {
  color: string;
  size: number;
  top: number;
  left: number;
  driftX: number;
  driftY: number;
  duration: number;
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

function useBlobConfigs(): BlobConfig[] {
  return useMemo(() => {
    const palette = [colors.primary, colors.secondary, colors.warning];
    const layout: Omit<BlobConfig, "color">[] = [
      {
        size: SCREEN_WIDTH * 0.95,
        top: -SCREEN_WIDTH * 0.4,
        left: -SCREEN_WIDTH * 0.3,
        driftX: 24,
        driftY: 16,
        duration: 9000,
      },
      {
        size: SCREEN_WIDTH * 0.8,
        top: SCREEN_HEIGHT * 0.32,
        left: SCREEN_WIDTH * 0.5,
        driftX: -20,
        driftY: 22,
        duration: 11000,
      },
      {
        size: SCREEN_WIDTH * 0.85,
        top: SCREEN_HEIGHT * 0.75,
        left: -SCREEN_WIDTH * 0.3,
        driftX: 18,
        driftY: -18,
        duration: 13000,
      },
    ];
    return layout.map((blob, index) => ({ ...blob, color: palette[index % palette.length] }));
  }, []);
}

function Blob({ config, opacity }: { config: BlobConfig; opacity: number }) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration: config.duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [config.duration, drift]);

  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [-config.driftX, config.driftX] });
  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [-config.driftY, config.driftY] });
  const scale = drift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.1] });

  return (
    <Animated.View
      style={[
        styles.blob,
        {
          top: config.top,
          left: config.left,
          width: config.size,
          height: config.size,
          borderRadius: config.size / 2,
          opacity,
          transform: [{ translateX }, { translateY }, { scale }],
        },
      ]}
    >
      <LinearGradient
        colors={[config.color, "transparent"]}
        style={styles.blobGradient}
        start={{ x: 0.25, y: 0.15 }}
        end={{ x: 1, y: 1 }}
      />
    </Animated.View>
  );
}

export function AnimatedBackground({ intensity = "subtle" }: { intensity?: BackgroundIntensity }) {
  const configs = useBlobConfigs();
  const opacity = intensity === "vivid" ? 0.32 : 0.14;

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      {configs.map((config, index) => (
        <Blob key={index} config={config} opacity={opacity} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  blob: {
    position: "absolute",
  },
  blobGradient: {
    flex: 1,
    borderRadius: 9999,
  },
});
