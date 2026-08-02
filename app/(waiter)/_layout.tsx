import { Stack } from "expo-router";
import { View } from "react-native";

import { RoleGate } from "@/components/RoleGate";
import { WebSidebarNav, type WebSidebarNavItem } from "@/components/ui/WebSidebarNav";
import { useIsWideWeb } from "@/hooks/useIsWideWeb";

const NAV_ITEMS: WebSidebarNavItem[] = [
  { href: "/(waiter)", label: "Siparişler", icon: "home" },
  { href: "/(waiter)/katalog", label: "Katalog", icon: "restaurant-menu" },
  { href: "/(waiter)/gecmis", label: "Geçmiş", icon: "history" },
  { href: "/(waiter)/hesabim", label: "Hesabım", icon: "person" },
];

export default function WaiterLayout() {
  const isWideWeb = useIsWideWeb();

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="siparis/[id]" options={{ presentation: "card" }} />
    </Stack>
  );

  return (
    <RoleGate allow={["waiter"]}>
      {isWideWeb ? (
        <View style={{ flex: 1, flexDirection: "row" }}>
          <WebSidebarNav items={NAV_ITEMS} />
          <View style={{ flex: 1 }}>{stack}</View>
        </View>
      ) : (
        stack
      )}
    </RoleGate>
  );
}
