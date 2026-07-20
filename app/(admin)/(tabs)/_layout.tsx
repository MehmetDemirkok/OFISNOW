import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { colors } from "@/constants/theme";

export default function AdminTabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.onSurfaceVariant,
        tabBarStyle: { height: 64, paddingBottom: 8, paddingTop: 8 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: "600" },
      }}
    >
      <Tabs.Screen
        name="urunler"
        options={{
          title: "Ürünler",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="restaurant" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="kategoriler"
        options={{
          title: "Kategoriler",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="list-alt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="konumlar"
        options={{
          title: "Konumlar",
          tabBarIcon: ({ color, size }) => (
            <MaterialIcons name="location-on" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="kullanicilar"
        options={{
          title: "Kullanıcılar",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="group" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}
