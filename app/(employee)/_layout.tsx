import { Stack } from "expo-router";

import { RoleGate } from "@/components/RoleGate";

export default function EmployeeLayout() {
  return (
    <RoleGate allow={["employee"]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="kategori/[id]" options={{ presentation: "card" }} />
        <Stack.Screen name="siparis/yeni" options={{ presentation: "modal" }} />
        <Stack.Screen name="siparis/[id]" options={{ presentation: "card" }} />
      </Stack>
    </RoleGate>
  );
}
