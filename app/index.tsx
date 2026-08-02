import { Redirect } from "expo-router";
import { Platform } from "react-native";

import { LoadingView } from "@/components/ui/LoadingView";
import { WelcomeScreen } from "@/components/marketing/WelcomeScreen";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingView />;

  if (!session) {
    if (Platform.OS === "web") return <WelcomeScreen />;
    return <Redirect href="/login" />;
  }

  if (!profile) return <LoadingView label="Profil yükleniyor..." />;

  if (profile.role === "waiter") return <Redirect href="/(waiter)" />;
  return <Redirect href="/(employee)" />;
}
