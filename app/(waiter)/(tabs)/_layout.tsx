import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { tabBarScreenOptions } from "@/constants/theme";
import { useIsWideWeb } from "@/hooks/useIsWideWeb";

export default function WaiterTabsLayout() {
  // Geniş webde navigasyonu üst seviyedeki WebSidebarNav sağlıyor; alt sekme
  // çubuğu tekrar görünmesin diye gizlenir.
  const isWideWeb = useIsWideWeb();
  const screenOptions = isWideWeb
    ? { ...tabBarScreenOptions, tabBarStyle: { display: "none" as const } }
    : tabBarScreenOptions;

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Siparişler",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="katalog"
        options={{
          title: "Katalog",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant-menu" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="gecmis"
        options={{
          title: "Geçmiş",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="history" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="hesabim"
        options={{
          title: "Hesabım",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="person" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
