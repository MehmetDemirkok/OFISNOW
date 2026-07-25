import { Image, StyleSheet, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { productVisual } from "@/constants/productIcons";
import { drinkImage } from "@/constants/drinkImages";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";
import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function ProductCard({ product, quantity, onIncrement, onDecrement }: ProductCardProps) {
  const visual = productVisual(product.name);
  const preset = drinkImage(product.name);

  return (
    <View style={[styles.card, quantity > 0 && styles.cardActive]}>
      {product.image_url ? (
        <Image source={{ uri: product.image_url }} style={styles.thumb} />
      ) : preset ? (
        <View style={[styles.thumbPlaceholder, { backgroundColor: visual.bg }]}>
          <Image source={preset} style={styles.thumbPreset} />
        </View>
      ) : (
        <View style={[styles.thumbPlaceholder, { backgroundColor: visual.bg }]}>
          <MaterialCommunityIcons name={visual.icon} size={30} color={visual.fg} />
        </View>
      )}
      <View style={styles.info}>
        <View style={styles.headerRow}>
          <Text style={styles.name}>{product.name}</Text>
        </View>
        {product.description ? (
          <Text style={styles.description} numberOfLines={2}>
            {product.description}
          </Text>
        ) : null}
        <View style={styles.stepperRow}>
          <QuantityStepper quantity={quantity} onIncrement={onIncrement} onDecrement={onDecrement} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  cardActive: {
    backgroundColor: colors.primaryFixed,
  },
  thumb: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    resizeMode: "cover",
  },
  thumbPlaceholder: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  thumbPreset: {
    width: "72%",
    height: "72%",
    resizeMode: "contain",
  },
  info: {
    flex: 1,
    gap: spacing.xs,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  name: {
    ...typography.headlineSm,
    color: colors.onSurface,
    flexShrink: 1,
  },
  description: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  stepperRow: {
    flexDirection: "row",
    marginTop: spacing.xs,
  },
});
