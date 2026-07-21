import { MaterialIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";

import { tabBarScreenOptions } from "@/constants/theme";

export default function WaiterTabsLayout() {
  return (
    <Tabs screenOptions={tabBarScreenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Siparişler",
          tabBarIcon: ({ color, size }) => <MaterialIcons name="home" size={size} color={color} />,
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
    </Tabs>
  );
}
