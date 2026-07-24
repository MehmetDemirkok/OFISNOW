import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { PwaInstallRow } from "@/components/ui/PwaInstallRow";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { WebPushEnableRow } from "@/components/ui/WebPushEnableRow";
import { useAuth } from "@/context/AuthContext";
import { showAlert } from "@/lib/alert";
import { getInitials } from "@/lib/initials";
import { safeGoBack } from "@/lib/navigation";
import { supabase, toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, roleLabels, shadows, spacing, typography } from "@/constants/theme";

export default function AccountSettingsScreen() {
  const { profile } = useAuth();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const fallbackHref = profile.role === "waiter" ? "/(waiter)" : "/(employee)";
  const canSave = newPassword.length >= 6 && newPassword === confirmPassword && !saving;

  async function handleChangePassword() {
    if (!canSave) return;

    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      setNewPassword("");
      setConfirmPassword("");
      showAlert("Kaydedildi", "Şifreniz güncellendi.");
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => safeGoBack(fallbackHref)} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Hesap Ayarları</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <Pressable style={styles.identityCard} onPress={() => router.push("/profile")}>
            <View style={styles.identityAvatar}>
              <Text style={styles.identityAvatarText}>{getInitials(profile.full_name)}</Text>
            </View>
            <View style={styles.identityTextGroup}>
              <Text style={styles.identityName} numberOfLines={1}>
                {profile.full_name}
              </Text>
              <Text style={styles.identityEmail} numberOfLines={1}>
                {profile.email}
              </Text>
            </View>
            <View style={styles.identityRoleChip}>
              <Text style={styles.identityRoleChipText}>{roleLabels[profile.role] ?? profile.role}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
          </Pressable>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Şifre Değiştir</Text>
              <Text style={styles.sectionHint}>Hesabınızın güvenliği için en az 6 karakterli bir şifre belirleyin.</Text>
            </View>

            <View style={styles.card}>
              <View style={styles.fieldGroup}>
                <Text style={styles.inputLabel}>Yeni Şifre</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock" size={20} color={colors.outline} />
                  <TextInput
                    style={styles.input}
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="En az 6 karakter"
                    placeholderTextColor={colors.outline}
                    secureTextEntry
                    textContentType="newPassword"
                  />
                </View>
              </View>

              <View style={[styles.fieldGroup, { marginBottom: 0 }]}>
                <Text style={styles.inputLabel}>Yeni Şifre (Tekrar)</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="lock" size={20} color={colors.outline} />
                  <TextInput
                    style={styles.input}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="Şifreyi tekrar girin"
                    placeholderTextColor={colors.outline}
                    secureTextEntry
                    textContentType="newPassword"
                  />
                </View>
              </View>
            </View>

            <Button
              label={saving ? "Kaydediliyor..." : "Şifreyi Güncelle"}
              onPress={handleChangePassword}
              disabled={!canSave}
              loading={saving}
            />
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Bildirimler ve Kurulum</Text>
            <PwaInstallRow />
            <WebPushEnableRow />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  content: {
    padding: spacing.md,
    gap: spacing.lg,
    paddingBottom: spacing.xl,
  },
  identityCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  identityAvatar: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  identityAvatarText: {
    ...typography.headlineSm,
    color: "#ffffff",
  },
  identityTextGroup: {
    flex: 1,
    gap: 2,
  },
  identityName: {
    ...typography.bodyLg,
    fontWeight: "700",
    color: colors.onSurface,
  },
  identityEmail: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  identityRoleChip: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
  },
  identityRoleChipText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
  },
  section: {
    gap: spacing.md,
  },
  sectionHeader: {
    gap: 2,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  sectionHint: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  fieldGroup: {
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  inputLabel: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    textTransform: "none",
    letterSpacing: 0,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    height: 56,
  },
  input: {
    flex: 1,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
});
