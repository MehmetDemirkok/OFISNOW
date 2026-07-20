import { Redirect } from "expo-router";
import type { ReactNode } from "react";

import { LoadingView } from "@/components/ui/LoadingView";
import { useAuth } from "@/context/AuthContext";
import type { UserRole } from "@/types/database";

/** İlgili rol grubunun (employee/waiter/admin) dışından erişimi engeller. */
export function RoleGate({ allow, children }: { allow: UserRole[]; children: ReactNode }) {
  const { loading, session, profile } = useAuth();

  if (loading) return <LoadingView />;
  if (!session) return <Redirect href="/login" />;
  if (!profile) return <LoadingView label="Profil yükleniyor..." />;

  if (!allow.includes(profile.role)) {
    if (profile.role === "waiter") return <Redirect href="/(waiter)" />;
    if (profile.role === "admin") return <Redirect href="/(admin)" />;
    return <Redirect href="/(employee)" />;
  }

  return <>{children}</>;
}
