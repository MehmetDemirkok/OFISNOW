import { StyleSheet, Text, View } from "react-native";

import { QuantityStepper } from "@/components/ui/QuantityStepper";
import { colors, radius, spacing, typography } from "@/constants/theme";
import type { Product } from "@/types/database";

interface ProductCardProps {
  product: Product;
  quantity: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

export function ProductCard({ product, quantity, onIncrement, onDecrement }: ProductCardProps) {
  return (
    <View style={[styles.card, quantity > 0 && styles.cardActive]}>
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
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.md,
  },
  cardActive: {
    borderColor: colors.primary,
  },
  info: {
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
