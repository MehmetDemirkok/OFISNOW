import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { colors, radius, spacing, typography } from "@/constants/theme";
import type { UserRole } from "@/types/database";

const roleLabels: Record<UserRole, string> = {
  admin: "Yönetici",
  employee: "Çalışan",
  waiter: "Garson",
};

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

export function AccountCorner() {
  const { profile, signOut } = useAuth();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  if (!profile) return null;

  function closeSheet() {
    setOpen(false);
    setConfirming(false);
  }

  async function performSignOut() {
    setSigningOut(true);
    try {
      await signOut();
      setOpen(false);
      setConfirming(false);
      router.replace("/login");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <View pointerEvents="box-none" style={[styles.overlay, { top: insets.top + spacing.xs }]}>
      <Pressable style={styles.badge} onPress={() => setOpen(true)} hitSlop={8}>
        <Text style={styles.badgeText}>{getInitials(profile.full_name)}</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeSheet}>
        <Pressable style={styles.backdrop} onPress={closeSheet}>
          <Pressable style={[styles.sheet, { marginTop: insets.top + 64 }]} onPress={(e) => e.stopPropagation()}>
            {confirming ? (
              <>
                <View style={styles.avatarLg}>
                  <MaterialIcons name="logout" size={24} color="#ffffff" />
                </View>
                <Text style={styles.name}>Çıkış Yap</Text>
                <Text style={styles.confirmText}>Hesabınızdan çıkış yapmak istediğinize emin misiniz?</Text>

                <Pressable
                  style={[styles.logoutButton, signingOut && styles.logoutButtonDisabled]}
                  onPress={performSignOut}
                  disabled={signingOut}
                >
                  {signingOut ? (
                    <ActivityIndicator color={colors.error} size="small" />
                  ) : (
                    <MaterialIcons name="logout" size={20} color={colors.error} />
                  )}
                  <Text style={styles.logoutText}>{signingOut ? "Çıkış yapılıyor..." : "Evet, Çıkış Yap"}</Text>
                </Pressable>

                <Pressable style={styles.closeButton} onPress={() => setConfirming(false)} disabled={signingOut}>
                  <Text style={styles.closeText}>Vazgeç</Text>
                </Pressable>
              </>
            ) : (
              <>
                <View style={styles.avatarLg}>
                  <Text style={styles.avatarLgText}>{getInitials(profile.full_name)}</Text>
                </View>

                <Text style={styles.name} numberOfLines={1}>
                  {profile.full_name}
                </Text>
                <Text style={styles.email} numberOfLines={1}>
                  {profile.email}
                </Text>

                <View style={styles.roleChip}>
                  <Text style={styles.roleChipText}>{roleLabels[profile.role] ?? profile.role}</Text>
                </View>

                <Pressable style={styles.logoutButton} onPress={() => setConfirming(true)}>
                  <MaterialIcons name="logout" size={20} color={colors.error} />
                  <Text style={styles.logoutText}>Çıkış Yap</Text>
                </Pressable>

                <Pressable style={styles.closeButton} onPress={closeSheet}>
                  <Text style={styles.closeText}>Kapat</Text>
                </Pressable>
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    right: spacing.md,
    zIndex: 50,
    elevation: 50,
  },
  badge: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  badgeText: {
    ...typography.labelLg,
    color: "#ffffff",
    fontWeight: "700",
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "flex-end",
  },
  sheet: {
    width: 260,
    marginRight: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  avatarLg: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  avatarLgText: {
    ...typography.headlineMd,
    color: "#ffffff",
  },
  name: {
    ...typography.bodyLg,
    fontWeight: "700",
    color: colors.onSurface,
    textAlign: "center",
    maxWidth: "100%",
  },
  email: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    maxWidth: "100%",
  },
  confirmText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  roleChip: {
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
  },
  roleChipText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.sm,
    width: "100%",
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.errorContainer,
  },
  logoutButtonDisabled: {
    opacity: 0.6,
  },
  logoutText: {
    ...typography.bodyLg,
    fontWeight: "600",
    color: colors.error,
  },
  closeButton: {
    marginTop: spacing.sm,
    paddingVertical: spacing.xs,
  },
  closeText: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
});
