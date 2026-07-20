import { RefreshControl, ScrollView, StyleSheet, Switch, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { AdminScreenHeader } from "@/components/admin/AdminScreenHeader";
import { InviteCodeCard } from "@/components/admin/InviteCodeCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchAllProfiles, updateProfile } from "@/lib/api/profiles";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, spacing, typography } from "@/constants/theme";
import type { Profile, UserRole } from "@/types/database";

const ROLE_LABEL: Record<UserRole, string> = {
  employee: "Çalışan",
  waiter: "Garson",
  admin: "Admin",
};

const ROLE_ORDER: UserRole[] = ["employee", "waiter", "admin"];

function UserRow({
  profile,
  isSelf,
  onChangeRole,
  onToggleActive,
}: {
  profile: Profile;
  isSelf: boolean;
  onChangeRole: (role: UserRole) => void;
  onToggleActive: (value: boolean) => void;
}) {
  return (
    <View style={[styles.row, !profile.is_active && styles.rowInactive]}>
      <View style={styles.rowHeader}>
        <View style={styles.avatar}>
          <MaterialIcons name="person" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.name}>
            {profile.full_name}
            {isSelf ? " (siz)" : ""}
          </Text>
          <Text style={styles.email}>{profile.email}</Text>
        </View>
        <Switch
          value={profile.is_active}
          onValueChange={onToggleActive}
          disabled={isSelf}
          trackColor={{ false: colors.outlineVariant, true: colors.primary }}
        />
      </View>

      <View style={styles.chipRow}>
        {ROLE_ORDER.map((role) => (
          <View key={role} style={styles.chipWrapper}>
            <Text
              onPress={() => !isSelf && role !== profile.role && onChangeRole(role)}
              style={[
                styles.chip,
                role === profile.role && styles.chipSelected,
                isSelf && styles.chipDisabled,
              ]}
            >
              {ROLE_LABEL[role]}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function AdminUsersScreen() {
  const { profile: myProfile } = useAuth();
  const { data: profiles, loading, error, refetch, refreshing } = useAsyncData(
    fetchAllProfiles,
    []
  );

  async function handleChangeRole(id: string, role: UserRole) {
    try {
      await updateProfile(id, { role });
      refetch();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    }
  }

  async function handleToggleActive(id: string, value: boolean) {
    try {
      await updateProfile(id, { is_active: value });
      refetch();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    }
  }

  return (
    <ScreenContainer>
      <AdminScreenHeader title="Kullanıcılar" />

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={!!refreshing} onRefresh={refetch} />}
        >
          <InviteCodeCard />

          {profiles?.length ? (
            profiles.map((p) => (
              <UserRow
                key={p.id}
                profile={p}
                isSelf={p.id === myProfile?.id}
                onChangeRole={(role) => handleChangeRole(p.id, role)}
                onToggleActive={(value) => handleToggleActive(p.id, value)}
              />
            ))
          ) : (
            <EmptyState icon="group" title="Kayıtlı kullanıcı yok" />
          )}
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.sm,
    paddingBottom: spacing.xl,
  },
  row: {
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.sm,
  },
  rowInactive: {
    opacity: 0.6,
  },
  rowHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  name: {
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  email: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  chipRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  chipWrapper: {
    flex: 1,
  },
  chip: {
    ...typography.labelLg,
    textAlign: "center",
    textTransform: "none",
    letterSpacing: 0,
    color: colors.onSurface,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.full,
    paddingVertical: spacing.xs,
    overflow: "hidden",
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    color: "#ffffff",
  },
  chipDisabled: {
    opacity: 0.5,
  },
});
