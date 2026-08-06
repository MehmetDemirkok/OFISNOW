import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect } from "expo-router";
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
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { inviteTeammateByEmail } from "@/lib/api/company";
import { showAlert } from "@/lib/alert";
import { safeGoBack } from "@/lib/navigation";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";
import type { UserRole } from "@/types/database";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "employee", label: "Çalışan" },
  { value: "waiter", label: "Görevli" },
];

const EMAIL_PATTERN = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export default function InviteTeammateScreen() {
  const { profile } = useAuth();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>("employee");
  const [sending, setSending] = useState(false);

  if (!profile) return null;
  if (profile.role !== "employee" && profile.role !== "waiter") {
    return <Redirect href="/" />;
  }

  const trimmedEmail = email.trim();
  const canSend = EMAIL_PATTERN.test(trimmedEmail) && !sending;

  async function handleSend() {
    if (!canSend) return;

    setSending(true);
    try {
      await inviteTeammateByEmail(trimmedEmail, role);
      setEmail("");
      showAlert(
        "Davet gönderildi",
        `${trimmedEmail} adresine bir davet e-postası gönderdik. Bağlantı 7 gün geçerli olacak.`,
        [{ text: "Tamam", onPress: () => safeGoBack("/(employee)") }]
      );
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => safeGoBack("/(employee)")} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Arkadaşını Davet Et</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.infoCard}>
            <View style={styles.infoIconCircle}>
              <MaterialIcons name="mail" size={20} color={colors.primary} />
            </View>
            <Text style={styles.infoText}>
              Şirketinden bir arkadaşının e-posta adresini gir; ona OfisNow'a katılması için bir davet
              bağlantısı gönderelim. Davet, girdiğin e-posta adresiyle kayıt olununca kullanılabilir ve 7
              gün geçerlidir.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>E-posta Adresi</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="arkadasin@sirket.com"
                placeholderTextColor={colors.outline}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                onSubmitEditing={handleSend}
                returnKeyType="go"
              />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Rolü</Text>
            <View style={styles.roleRow}>
              {ROLE_OPTIONS.map((option) => {
                const isSelected = role === option.value;
                return (
                  <Pressable
                    key={option.value}
                    style={[styles.roleChip, isSelected && styles.roleChipSelected]}
                    onPress={() => setRole(option.value)}
                  >
                    <Text style={[styles.roleChipText, isSelected && styles.roleChipTextSelected]}>
                      {option.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={styles.hint}>
              {role === "waiter"
                ? "Görevli; gelen siparişleri karşılar, katalogu yönetir."
                : "Çalışan; ofisten sipariş verir, sipariş geçmişini görür."}
            </Text>
          </View>

          <Button label={sending ? "Gönderiliyor..." : "Davet Gönder"} onPress={handleSend} disabled={!canSend} loading={sending} />
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
  infoCard: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.primaryFixed,
    borderRadius: radius.lg,
    padding: spacing.md,
  },
  infoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: radius.full,
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  infoText: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.sm,
    paddingHorizontal: spacing.md,
  },
  input: {
    height: 52,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  roleRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  roleChip: {
    flex: 1,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    alignItems: "center",
    justifyContent: "center",
  },
  roleChipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleChipText: {
    ...typography.bodyMd,
    fontWeight: "600",
    color: colors.onSurface,
  },
  roleChipTextSelected: {
    color: "#ffffff",
  },
  hint: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
});
