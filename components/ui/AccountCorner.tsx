import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/context/AuthContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchOrRotateInviteCode } from "@/lib/api/company";
import { updateMyLocation } from "@/lib/api/profiles";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, spacing, typography, webShell } from "@/constants/theme";
import type { UserRole } from "@/types/database";
import { PwaInstallRow } from "@/components/ui/PwaInstallRow";
import { WebPushEnableRow } from "@/components/ui/WebPushEnableRow";

const roleLabels: Record<UserRole, string> = {
  employee: "Çalışan",
  waiter: "Görevli",
};

const INVITE_CODE_REFRESH_MS = 10 * 60 * 1000;

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

export function AccountCorner() {
  const { profile, signOut, refreshProfile } = useAuth();
  const insets = useSafeAreaInsets();
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [codeCopied, setCodeCopied] = useState(false);
  const [editingLocation, setEditingLocation] = useState(false);
  const [locationInput, setLocationInput] = useState("");
  const [savingLocation, setSavingLocation] = useState(false);

  const isEmployee = profile?.role === "employee";
  const {
    data: inviteCode,
    refetch: refetchInviteCode,
  } = useAsyncData(() => (isEmployee ? fetchOrRotateInviteCode() : Promise.resolve(null)), [isEmployee]);

  // Davet kodu 10 dakikada bir kendiliğinden yenilenir; sheet her açıldığında da tazelenir.
  useEffect(() => {
    if (!isEmployee) return;
    const interval = setInterval(() => refetchInviteCode(), INVITE_CODE_REFRESH_MS);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEmployee]);

  useEffect(() => {
    if (open && isEmployee) refetchInviteCode();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!profile) return null;

  async function handleCopyInviteCode() {
    if (!inviteCode) return;
    await Clipboard.setStringAsync(inviteCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 1500);
  }

  function openLocationEditor() {
    setLocationInput(profile?.location_description ?? "");
    setEditingLocation(true);
  }

  async function handleSaveLocation() {
    setSavingLocation(true);
    try {
      await updateMyLocation(locationInput.trim());
      await refreshProfile();
      setEditingLocation(false);
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setSavingLocation(false);
    }
  }

  function openProfile() {
    setOpen(false);
    router.push("/profile");
  }

  function closeSheet() {
    setOpen(false);
    setConfirming(false);
    setEditingLocation(false);
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
        {profile.avatar_url ? (
          <Image source={{ uri: profile.avatar_url }} style={styles.badgeImage} />
        ) : (
          <Text style={styles.badgeText}>{getInitials(profile.full_name)}</Text>
        )}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={closeSheet}>
        <Pressable style={styles.backdrop} onPress={closeSheet}>
          {/* Modal (RN Web'de) tüm tarayıcı penceresine portallanır; masaüstünde
              WebShell'in telefon genişliğindeki kabuğuyla hizalı kalması için
              içerik burada aynı genişliğe ortalanır. */}
          <View style={styles.backdropInner} pointerEvents="box-none">
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
                {profile.avatar_url ? (
                  <Image source={{ uri: profile.avatar_url }} style={styles.avatarLgImage} />
                ) : (
                  <View style={styles.avatarLg}>
                    <Text style={styles.avatarLgText}>{getInitials(profile.full_name)}</Text>
                  </View>
                )}

                <Text style={styles.name} numberOfLines={1}>
                  {profile.full_name}
                </Text>
                {profile.job_title ? (
                  <Text style={styles.jobTitle} numberOfLines={1}>
                    {profile.job_title}
                  </Text>
                ) : null}
                <Text style={styles.email} numberOfLines={1}>
                  {profile.email}
                </Text>

                <View style={styles.roleChip}>
                  <Text style={styles.roleChipText}>{roleLabels[profile.role] ?? profile.role}</Text>
                </View>

                <Pressable style={styles.editProfileRow} onPress={openProfile} hitSlop={4}>
                  <MaterialIcons name="edit" size={16} color={colors.primary} />
                  <Text style={styles.editProfileText}>Profili Düzenle</Text>
                </Pressable>

                <PwaInstallRow />
                <WebPushEnableRow />

                {isEmployee && inviteCode ? (
                  <Pressable style={styles.inviteRow} onPress={handleCopyInviteCode} hitSlop={4}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inviteLabel}>Davet Kodu (10 dk'da bir yenilenir)</Text>
                      <Text style={styles.inviteCode}>{inviteCode}</Text>
                    </View>
                    <MaterialIcons
                      name={codeCopied ? "check" : "content-copy"}
                      size={18}
                      color={codeCopied ? colors.success : colors.primary}
                    />
                  </Pressable>
                ) : null}

                {isEmployee && editingLocation ? (
                  <View style={styles.locationEditBox}>
                    <TextInput
                      style={[styles.locationInput, styles.locationInputMultiline]}
                      value={locationInput}
                      onChangeText={setLocationInput}
                      placeholder="Örn. 3. kat, mutfağın karşısı, mavi kapı"
                      placeholderTextColor={colors.outline}
                      multiline
                      autoFocus
                    />
                    <View style={styles.locationEditButtons}>
                      <Pressable
                        style={styles.locationCancelButton}
                        onPress={() => setEditingLocation(false)}
                        disabled={savingLocation}
                      >
                        <Text style={styles.locationCancelText}>Vazgeç</Text>
                      </Pressable>
                      <Pressable
                        style={styles.locationSaveButton}
                        onPress={handleSaveLocation}
                        disabled={savingLocation}
                      >
                        {savingLocation ? (
                          <ActivityIndicator color="#ffffff" size="small" />
                        ) : (
                          <Text style={styles.locationSaveText}>Kaydet</Text>
                        )}
                      </Pressable>
                    </View>
                  </View>
                ) : isEmployee ? (
                  <Pressable style={styles.inviteRow} onPress={openLocationEditor} hitSlop={4}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.inviteLabel}>Oda Tarifiniz</Text>
                      <Text style={styles.locationText} numberOfLines={2}>
                        {profile.location_description?.trim() || "Belirtilmemiş"}
                      </Text>
                    </View>
                    <MaterialIcons name="edit" size={18} color={colors.primary} />
                  </Pressable>
                ) : null}

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
          </View>
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
  badgeImage: {
    width: "100%",
    height: "100%",
    borderRadius: radius.full,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
  },
  backdropInner: {
    flex: 1,
    width: "100%",
    maxWidth: webShell.maxWidth,
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
  avatarLgImage: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    marginBottom: spacing.xs,
    backgroundColor: colors.surfaceContainer,
  },
  editProfileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  editProfileText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
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
  jobTitle: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "600",
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
  inviteRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  inviteLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  inviteCode: {
    ...typography.bodyLg,
    fontWeight: "700",
    letterSpacing: 2,
    color: colors.onSurface,
  },
  locationText: {
    ...typography.bodyMd,
    fontWeight: "600",
    color: colors.onSurface,
  },
  locationEditBox: {
    width: "100%",
    gap: spacing.xs,
    marginBottom: spacing.sm,
  },
  locationInput: {
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  locationInputMultiline: {
    height: 72,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },
  locationEditButtons: {
    flexDirection: "row",
    gap: spacing.xs,
  },
  locationCancelButton: {
    flex: 1,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerHigh,
  },
  locationCancelText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
  locationSaveButton: {
    flex: 1,
    height: 36,
    borderRadius: radius.sm,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  locationSaveText: {
    ...typography.labelMd,
    color: "#ffffff",
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
