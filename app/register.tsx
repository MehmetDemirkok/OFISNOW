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
import { Redirect, router } from "expo-router";

import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { showAlert } from "@/lib/alert";
import { colors, radius, spacing, typography } from "@/constants/theme";

type Mode = "create" | "join";
type JoinRole = "employee" | "waiter";

const JOIN_ROLE_LABEL: Record<JoinRole, string> = {
  employee: "Çalışan",
  waiter: "Garson",
};

export default function RegisterScreen() {
  const { session, signUp } = useAuth();
  const [mode, setMode] = useState<Mode>("create");

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [inviteCode, setInviteCode] = useState("");
  const [joinRole, setJoinRole] = useState<JoinRole>("employee");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const baseValid =
    fullName.trim().length > 1 && email.trim().length > 3 && password.length >= 6 && !submitting;
  const canSubmit =
    mode === "create"
      ? baseValid && companyName.trim().length > 1
      : baseValid && inviteCode.trim().length >= 4;

  if (session) return <Redirect href="/" />;

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      const { needsEmailConfirm } = await signUp(
        fullName.trim(),
        email.trim(),
        password,
        mode === "create"
          ? { mode: "create", companyName: companyName.trim() }
          : { mode: "join", inviteCode: inviteCode.trim(), role: joinRole }
      );
      if (needsEmailConfirm) {
        showAlert(
          "Hesabın oluşturuldu",
          "E-postana gelen bağlantıyla hesabını onayladıktan sonra giriş yapabilirsin.",
          [{ text: "Tamam", onPress: () => router.replace("/login") }]
        );
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Kayıt olunamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.header}>
            <View style={styles.logoCircle}>
              <MaterialIcons name="person-add" size={32} color="#ffffff" />
            </View>
            <Text style={styles.title}>Hesap Oluştur</Text>
            <Text style={styles.subtitle}>Yeni bir şirket kur ya da bir davet koduyla ekibe katıl</Text>
          </View>

          <View style={styles.modeSwitch}>
            <Pressable
              style={[styles.modeButton, mode === "create" && styles.modeButtonActive]}
              onPress={() => setMode("create")}
            >
              <MaterialIcons
                name="business"
                size={18}
                color={mode === "create" ? "#ffffff" : colors.onSurfaceVariant}
              />
              <Text style={[styles.modeButtonText, mode === "create" && styles.modeButtonTextActive]}>
                Yeni Şirket Kur
              </Text>
            </Pressable>
            <Pressable
              style={[styles.modeButton, mode === "join" && styles.modeButtonActive]}
              onPress={() => setMode("join")}
            >
              <MaterialIcons
                name="group-add"
                size={18}
                color={mode === "join" ? "#ffffff" : colors.onSurfaceVariant}
              />
              <Text style={[styles.modeButtonText, mode === "join" && styles.modeButtonTextActive]}>
                Davet Koduyla Katıl
              </Text>
            </Pressable>
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
                  autoComplete="email"
                  keyboardType="email-address"
                  textContentType="emailAddress"
                />
              </View>
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Şifre</Text>
              <View style={styles.inputWrapper}>
                <MaterialIcons name="lock" size={20} color={colors.outline} />
                <TextInput
                  style={styles.input}
                  value={password}
                  onChangeText={setPassword}
                  placeholder="En az 6 karakter"
                  placeholderTextColor={colors.outline}
                  secureTextEntry
                  autoCapitalize="none"
                  textContentType="newPassword"
                  returnKeyType="next"
                />
              </View>
            </View>

            {mode === "create" ? (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Şirket Adı</Text>
                <View style={styles.inputWrapper}>
                  <MaterialIcons name="business" size={20} color={colors.outline} />
                  <TextInput
                    style={styles.input}
                    value={companyName}
                    onChangeText={setCompanyName}
                    placeholder="Şirketinizin adı"
                    placeholderTextColor={colors.outline}
                    onSubmitEditing={handleSubmit}
                    returnKeyType="go"
                  />
                </View>
                <Text style={styles.hint}>
                  Şirketi ilk sen kuruyorsun — otomatik olarak yönetici (admin) olacaksın.
                </Text>
              </View>
            ) : (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Davet Kodu</Text>
                  <View style={styles.inputWrapper}>
                    <MaterialIcons name="vpn-key" size={20} color={colors.outline} />
                    <TextInput
                      style={styles.input}
                      value={inviteCode}
                      onChangeText={(v) => setInviteCode(v.toUpperCase())}
                      placeholder="Örn. F9FBB192"
                      placeholderTextColor={colors.outline}
                      autoCapitalize="characters"
                      onSubmitEditing={handleSubmit}
                      returnKeyType="go"
                    />
                  </View>
                  <Text style={styles.hint}>Bu kodu şirketinizin admin'inden alabilirsiniz.</Text>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Rolün</Text>
                  <View style={styles.roleRow}>
                    {(Object.keys(JOIN_ROLE_LABEL) as JoinRole[]).map((role) => (
                      <Pressable
                        key={role}
                        style={[styles.roleChip, joinRole === role && styles.roleChipActive]}
                        onPress={() => setJoinRole(role)}
                      >
                        <Text
                          style={[styles.roleChipText, joinRole === role && styles.roleChipTextActive]}
                        >
                          {JOIN_ROLE_LABEL[role]}
                        </Text>
                      </Pressable>
                    ))}
                  </View>
                </View>
              </>
            )}

            {error ? (
              <View style={styles.errorBox}>
                <MaterialIcons name="error-outline" size={18} color={colors.error} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <Button
              label={submitting ? "Kayıt olunuyor..." : "KAYIT OL"}
              onPress={handleSubmit}
              disabled={!canSubmit}
              loading={submitting}
              style={{ marginTop: spacing.sm }}
            />

            <Pressable onPress={() => router.replace("/login")} hitSlop={8} style={styles.loginLink}>
              <Text style={styles.loginLinkText}>Zaten hesabın var mı? Giriş yap</Text>
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
    gap: spacing.lg,
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
  modeSwitch: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: 4,
    gap: 4,
  },
  modeButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 44,
    borderRadius: radius.sm,
  },
  modeButtonActive: {
    backgroundColor: colors.primary,
  },
  modeButtonText: {
    ...typography.labelLg,
    textTransform: "none",
    letterSpacing: 0,
    color: colors.onSurfaceVariant,
  },
  modeButtonTextActive: {
    color: "#ffffff",
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
  hint: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
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
  roleChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleChipText: {
    ...typography.bodyMd,
    fontWeight: "600",
    color: colors.onSurface,
  },
  roleChipTextActive: {
    color: "#ffffff",
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
  loginLink: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  loginLinkText: {
    ...typography.bodyMd,
    color: colors.primary,
  },
});
