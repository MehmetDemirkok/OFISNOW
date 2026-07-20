import { RefreshControl, ScrollView, StyleSheet, Text, View } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

import { AdminScreenHeader } from "@/components/admin/AdminScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchEmployees, fetchWaiters } from "@/lib/api/profiles";
import { colors, radius, spacing, typography } from "@/constants/theme";
import type { Profile } from "@/types/database";

function UserRow({ profile }: { profile: Profile }) {
  return (
    <View style={styles.row}>
      <View style={styles.avatar}>
        <MaterialIcons name="person" size={20} color={colors.primary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.name}>{profile.full_name}</Text>
        <Text style={styles.email}>{profile.email}</Text>
      </View>
      {!profile.is_active ? (
        <View style={styles.inactiveBadge}>
          <Text style={styles.inactiveText}>PASİF</Text>
        </View>
      ) : null}
    </View>
  );
}

export default function AdminUsersScreen() {
  const employees = useAsyncData(fetchEmployees, []);
  const waiters = useAsyncData(fetchWaiters, []);

  const loading = employees.loading || waiters.loading;
  const error = employees.error || waiters.error;
  const refreshing = employees.refreshing || waiters.refreshing;

  function refetchAll() {
    employees.refetch();
    waiters.refetch();
  }

  return (
    <ScreenContainer>
      <AdminScreenHeader title="Kullanıcılar" />

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refetchAll} />
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refetchAll} />}
        >
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Garsonlar ({waiters.data?.length ?? 0})</Text>
            {waiters.data?.length ? (
              waiters.data.map((p) => <UserRow key={p.id} profile={p} />)
            ) : (
              <EmptyState icon="group" title="Kayıtlı garson yok" />
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Çalışanlar ({employees.data?.length ?? 0})</Text>
            {employees.data?.length ? (
              employees.data.map((p) => <UserRow key={p.id} profile={p} />)
            ) : (
              <EmptyState icon="group" title="Kayıtlı çalışan yok" />
            )}
          </View>
        </ScrollView>
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.sm,
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
  inactiveBadge: {
    backgroundColor: colors.errorContainer,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  inactiveText: {
    ...typography.labelMd,
    color: colors.onErrorContainer,
  },
});
