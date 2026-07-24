import { useState } from "react";
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
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";

import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { showAlert } from "@/lib/alert";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function ResetPasswordScreen() {
  const { session, confirmPasswordReset, requestPasswordReset } = useAuth();
  const params = useLocalSearchParams<{ email?: string }>();

  const [email, setEmail] = useState(params.email ?? "");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [resending, setResending] = useState(false);

  const canSubmit =
    email.trim().length > 3 &&
    code.trim().length >= 6 &&
    newPassword.length >= 6 &&
    newPassword === confirmPassword &&
    !submitting;

  if (session) return <Redirect href="/" />;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await confirmPasswordReset(email.trim(), code, newPassword);
      showAlert("Şifren güncellendi", "Yeni şifrenle giriş yapabilirsin.", [
        { text: "Tamam", onPress: () => router.replace("/login") },
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Şifre güncellenemedi.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResend() {
    if (email.trim().length <= 3 || resending) return;
    setError(null);
    setResending(true);
    try {
      await requestPasswordReset(email.trim());
      showAlert("Kod tekrar gönderildi", "E-postana yeni bir doğrulama kodu gönderdik.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kod gönderilemedi.");
    } finally {
      setResending(false);
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backButton}>
            <MaterialIcons name="arrow-back" size={22} color={colors.onSurfaceVariant} />
          </Pressable>

          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="mark-email-read" size={32} color="#ffffff" />
            </View>
            <Text style={styles.title}>Kodu gir</Text>
            <Text style={styles.subtitle}>
              {params.email ? `${params.email} adresine` : "E-postana"} gönderdiğimiz 6 haneli kodu ve
              yeni şifreni gir.
            </Text>
          </View>

          <View style={styles.form}>
            {!params.email ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>E-posta</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="email" size={20} color={colors.outline} />
                  <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="ornek@sirket.com"
                    placeholderTextColor={colors.outline}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    textContentType="emailAddress"
                  />
                </View>
              </View>
            ) : null}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Doğrulama Kodu</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="pin" size={20} color={colors.outline} />
                <TextInput
                  style={[styles.input, styles.codeInput]}
                  value={code}
                  onChangeText={setCode}
                  placeholder="123456"
                  placeholderTextColor={colors.outline}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Yeni Şifre</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color={colors.outline} />
                <TextInput
                  style={styles.input}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  textContentType="newPassword"
                />
                <MaterialIcons
                  name={showPassword ? "visibility-off" : "visibility"}
                  size={20}
                  color={colors.outline}
                  onPress={() => setShowPassword((v) => !v)}
                  suppressHighlighting
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Yeni Şifre (Tekrar)</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color={colors.outline} />
                <TextInput
                  style={styles.input}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor={colors.outline}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  textContentType="newPassword"
                  onSubmitEditing={handleSubmit}
                  returnKeyType="go"
                />
              </View>
            </View>

            {error ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={18} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              label={submitting ? "Güncelleniyor..." : "ŞİFREYİ GÜNCELLE"}
              onPress={handleSubmit}
              disabled={!canSubmit}
              loading={submitting}
              style={{ marginTop: spacing.sm }}
            />

            <Pressable onPress={handleResend} hitSlop={8} disabled={resending} style={styles.registerLink}>
              <Text style={styles.registerLinkText}>
                {resending ? "Gönderiliyor..." : "Kodu tekrar gönder"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: spacing.lg,
    gap: spacing.xl,
  },
  backButton: {
    position: "absolute",
    top: spacing.lg,
    left: spacing.lg,
    zIndex: 1,
    padding: spacing.xs,
  },
  header: {
    alignItems: "center",
    gap: spacing.sm,
  },
  logoCircle: {
    width: 64,
    height: 64,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.headlineLg,
    color: colors.primary,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
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
  input: {
    flex: 1,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  codeInput: {
    letterSpacing: 4,
  },
  errorBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.errorContainer,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  errorText: {
    ...typography.bodyMd,
    color: colors.onErrorContainer,
    flexShrink: 1,
  },
  registerLink: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  registerLinkText: {
    ...typography.bodyMd,
    color: colors.primary,
  },
});
