import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";

import { supabase, toFriendlyErrorMessage } from "@/lib/supabase";
import type { Profile } from "@/types/database";

/**
 * Kayıt olurken ya yeni bir şirket kurulur (kayıt olan kişi çalışan olur ve
 * şirketi yönetir), ya da mevcut bir şirkete çalışanın verdiği davet koduyla
 * katılınır.
 */
export type SignUpCompanyInput =
  | { mode: "create"; companyName: string }
  | { mode: "join"; inviteCode: string; role: "employee"; locationDescription: string }
  | { mode: "join"; inviteCode: string; role: "waiter" };

interface AuthContextValue {
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    fullName: string,
    email: string,
    password: string,
    company: SignUpCompanyInput
  ) => Promise<{ needsEmailConfirm: boolean }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (error) {
      console.error("[OfisNow] profil alınamadı", error);
      setProfile(null);
      return;
    }
    setProfile(data as Profile);
  }, []);

  useEffect(() => {
    let isMounted = true;

    supabase.auth.getSession().then(async ({ data }) => {
      if (!isMounted) return;
      setSession(data.session);
      if (data.session?.user) {
        await loadProfile(data.session.user.id);
      }
      setLoading(false);
    });

    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, newSession) => {
      if (!isMounted) return;
      setSession(newSession);
      if (newSession?.user) {
        await loadProfile(newSession.user.id);
      } else {
        setProfile(null);
      }
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [loadProfile]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw new Error(toFriendlyErrorMessage(error));
  }, []);

  const signUp = useCallback(
    async (fullName: string, email: string, password: string, company: SignUpCompanyInput) => {
      const metadata =
        company.mode === "create"
          ? { full_name: fullName, company_name: company.companyName }
          : company.role === "employee"
            ? {
                full_name: fullName,
                invite_code: company.inviteCode,
                role: company.role,
                location_description: company.locationDescription,
              }
            : { full_name: fullName, invite_code: company.inviteCode, role: company.role };

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata },
      });
      if (error) throw new Error(toFriendlyErrorMessage(error));
      return { needsEmailConfirm: !data.session };
    },
    []
  );

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setProfile(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (session?.user) {
      await loadProfile(session.user.id);
    }
  }, [session, loadProfile]);

  const value = useMemo(
    () => ({ session, profile, loading, signIn, signUp, signOut, refreshProfile }),
    [session, profile, loading, signIn, signUp, signOut, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth, AuthProvider içinde kullanılmalıdır.");
  return ctx;
}
