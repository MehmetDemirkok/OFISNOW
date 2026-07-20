import { Redirect } from "expo-router";

import { LoadingView } from "@/components/ui/LoadingView";
import { useAuth } from "@/context/AuthContext";

export default function Index() {
  const { session, profile, loading } = useAuth();

  if (loading) return <LoadingView />;

  if (!session) return <Redirect href="/login" />;

  if (!profile) return <LoadingView label="Profil yükleniyor..." />;

  if (profile.role === "waiter") return <Redirect href="/(waiter)" />;
  if (profile.role === "admin") return <Redirect href="/(admin)" />;
  return <Redirect href="/(employee)" />;
}
