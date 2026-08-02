import { Stack } from "expo-router";
import { View } from "react-native";

import { RoleGate } from "@/components/RoleGate";
import { WebSidebarNav, type WebSidebarNavItem } from "@/components/ui/WebSidebarNav";
import { useIsWideWeb } from "@/hooks/useIsWideWeb";

const NAV_ITEMS: WebSidebarNavItem[] = [
  { href: "/(employee)", label: "Ana Sayfa", icon: "home" },
  { href: "/(employee)/siparislerim", label: "Siparişlerim", icon: "list-alt" },
  { href: "/(employee)/gecmis", label: "Geçmiş", icon: "history" },
  { href: "/(employee)/hesabim", label: "Hesabım", icon: "person" },
];

export default function EmployeeLayout() {
  const isWideWeb = useIsWideWeb();

  const stack = (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="kategori/[id]" options={{ presentation: "card" }} />
      <Stack.Screen name="siparis/yeni" options={{ presentation: "modal" }} />
      <Stack.Screen name="siparis/[id]" options={{ presentation: "card" }} />
    </Stack>
  );

  return (
    <RoleGate allow={["employee"]}>
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
