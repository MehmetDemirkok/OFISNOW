import { Stack } from "expo-router";

import { RoleGate } from "@/components/RoleGate";

export default function WaiterLayout() {
  return (
    <RoleGate allow={["waiter"]}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="siparis/[id]" options={{ presentation: "card" }} />
      </Stack>
    </RoleGate>
  );
}
