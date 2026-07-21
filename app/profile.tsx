import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ActivityIndicator,
  Image,
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
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { showAlert } from "@/lib/alert";
import { safeGoBack } from "@/lib/navigation";
import { updateMyProfile, uploadMyAvatar } from "@/lib/api/profiles";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, spacing, typography } from "@/constants/theme";

function getInitials(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.charAt(0).toUpperCase();
  return (parts[0]!.charAt(0) + parts[parts.length - 1]!.charAt(0)).toUpperCase();
}

function formatDateInput(text: string): string {
  const digits = text.replace(/\D/g, "").slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);
  return [day, month, year].filter(Boolean).join(".");
}

function displayToIso(display: string): string | null {
  const digits = display.replace(/\D/g, "");
  if (digits.length === 0) return null;
  if (digits.length !== 8) throw new Error("INVALID_DATE");

  const day = Number(digits.slice(0, 2));
  const month = Number(digits.slice(2, 4));
  const year = Number(digits.slice(4, 8));
  const date = new Date(Date.UTC(year, month - 1, day));
  const isValid =
    date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
  if (!isValid || year < 1900 || year > new Date().getFullYear()) throw new Error("INVALID_DATE");

  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function isoToDisplay(iso: string | null): string {
  if (!iso) return "";
  const [year, month, day] = iso.split("-");
  return `${day}.${month}.${year}`;
}

export default function ProfileScreen() {
  const { profile, refreshProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [jobTitle, setJobTitle] = useState(profile?.job_title ?? "");
  const [birthDateInput, setBirthDateInput] = useState(isoToDisplay(profile?.birth_date ?? null));
  const [avatarUri, setAvatarUri] = useState<string | null>(profile?.avatar_url ?? null);
  const [pickingAvatar, setPickingAvatar] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!profile) return null;

  const fallbackHref = profile.role === "waiter" ? "/(waiter)" : "/(employee)";
  const canSave = fullName.trim().length > 1 && !saving;

  async function handlePickAvatar() {
    setPickingAvatar(true);
    try {
      // Dinamik import: expo-image-picker'ın native modülü olmayan ortamlarda
      // (ör. yeniden derlenmemiş Expo Go) tüm ekranı çökertmek yerine yalnızca
      // bu aksiyon başarısız olur.
      const ImagePicker = await import("expo-image-picker");

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert("İzin gerekli", "Profil fotoğrafı seçebilmek için galeri izni vermelisiniz.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
      });
      if (result.canceled || !result.assets[0]) return;

      const publicUrl = await uploadMyAvatar(profile!.id, result.assets[0].uri);
      setAvatarUri(`${publicUrl}?t=${Date.now()}`);
    } catch (err) {
      if (err instanceof Error && err.message.includes("Cannot find native module")) {
        showAlert(
          "Fotoğraf seçilemiyor",
          "Bu özellik için uygulamanın yeniden derlenmesi gerekiyor (npx expo run:ios / run:android). Şimdilik diğer bilgilerini kaydedebilirsin."
        );
        return;
      }
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setPickingAvatar(false);
    }
  }

  async function handleSave() {
    if (!canSave) return;

    let birthDateIso: string | null;
    try {
      birthDateIso = displayToIso(birthDateInput);
    } catch {
      showAlert("Geçersiz tarih", "Doğum tarihini GG.AA.YYYY biçiminde girin, örn. 05.03.1990.");
      return;
    }

    setSaving(true);
    try {
      await updateMyProfile({
        fullName: fullName.trim(),
        birthDate: birthDateIso,
        avatarUrl: avatarUri ? avatarUri.split("?")[0]! : null,
        jobTitle: jobTitle.trim() || null,
      });
      await refreshProfile();
      showAlert("Kaydedildi", "Profiliniz güncellendi.", [
        { text: "Tamam", onPress: () => safeGoBack(fallbackHref) },
      ]);
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
        <Text style={styles.title}>Profili Düzenle</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.avatarSection}>
            <Pressable style={styles.avatarWrap} onPress={handlePickAvatar} disabled={pickingAvatar}>
              {avatarUri ? (
                <Image source={{ uri: avatarUri }} style={styles.avatarImage} />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarPlaceholderText}>{getInitials(fullName || profile.full_name)}</Text>
                </View>
              )}
              <View style={styles.avatarEditBadge}>
                {pickingAvatar ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <MaterialIcons name="photo-camera" size={16} color="#ffffff" />
                )}
              </View>
            </Pressable>
            <Text style={styles.avatarHint}>Fotoğrafı değiştirmek için dokunun</Text>
          </View>

          <View style={styles.form}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ad Soyad</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="person" size={20} color={colors.outline} />
                <TextInput
                  style={styles.input}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Ad Soyad"
                  placeholderTextColor={colors.outline}
                  autoComplete="name"
                  textContentType="name"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Ünvan</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="badge" size={20} color={colors.outline} />
                <TextInput
                  style={styles.input}
                  value={jobTitle}
                  onChangeText={setJobTitle}
                  placeholder="Örn. Ofis Yöneticisi"
                  placeholderTextColor={colors.outline}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Doğum Tarihi</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="cake" size={20} color={colors.outline} />
                <TextInput
                  style={styles.input}
                  value={birthDateInput}
                  onChangeText={(text) => setBirthDateInput(formatDateInput(text))}
                  placeholder="GG.AA.YYYY"
                  placeholderTextColor={colors.outline}
                  keyboardType="number-pad"
                  maxLength={10}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>E-posta</Text>
              <View style={[styles.inputWrapper, styles.inputWrapperDisabled]}>
                <MaterialIcons name="email" size={20} color={colors.outline} />
                <Text style={styles.readonlyValue}>{profile.email}</Text>
              </View>
            </View>

            <Button
              label={saving ? "Kaydediliyor..." : "Kaydet"}
              onPress={handleSave}
              disabled={!canSave}
              loading={saving}
              style={{ marginTop: spacing.sm }}
            />
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
  avatarSection: {
    alignItems: "center",
    gap: spacing.xs,
  },
  avatarWrap: {
    width: 96,
    height: 96,
  },
  avatarImage: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    ...typography.headlineLg,
    color: "#ffffff",
  },
  avatarEditBadge: {
    position: "absolute",
    right: 0,
    bottom: 0,
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  avatarHint: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  form: {
    gap: spacing.md,
  },
  inputGroup: {
    gap: spacing.xs,
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
  inputWrapperDisabled: {
    backgroundColor: colors.surfaceContainer,
  },
  input: {
    flex: 1,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  readonlyValue: {
    flex: 1,
    ...typography.bodyLg,
    color: colors.onSurfaceVariant,
  },
});
