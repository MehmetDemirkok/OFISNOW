import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { WaiterOrderDetailPane } from "@/components/waiter/WaiterOrderDetailPane";
import { safeGoBack } from "@/lib/navigation";
import { colors, spacing, typography } from "@/constants/theme";

export default function WaiterOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => safeGoBack("/(waiter)")} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Sipariş Detayı</Text>
        <View style={{ width: 24 }} />
      </View>

      <WaiterOrderDetailPane orderId={id} />
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
});
