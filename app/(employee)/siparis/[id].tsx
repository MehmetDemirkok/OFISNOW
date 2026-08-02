import { MaterialIcons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { EmployeeOrderDetailPane } from "@/components/employee/EmployeeOrderDetailPane";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { safeGoBack } from "@/lib/navigation";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function EmployeeOrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => safeGoBack("/(employee)")} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Sipariş Detayı</Text>
        <View style={{ width: 40 }} />
      </View>

      <EmployeeOrderDetailPane orderId={id} />
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
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
});
