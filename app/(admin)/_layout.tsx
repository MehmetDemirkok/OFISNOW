import { Stack } from "expo-router";

import { RoleGate } from "@/components/RoleGate";

export default function AdminLayout() {
  return (
    <RoleGate allow={["admin"]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="urunler/form" options={{ presentation: "modal" }} />
        <Stack.Screen name="konumlar/form" options={{ presentation: "modal" }} />
      </Stack>
    </RoleGate>
  );
}
