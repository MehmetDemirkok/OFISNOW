import { useEffect, useRef, useState } from "react";
import {
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
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, router } from "expo-router";

import { AnimatedErrorBanner } from "@/components/ui/AnimatedErrorBanner";
import { AnimatedFadeIn } from "@/components/ui/AnimatedFadeIn";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { AnimatedTextField } from "@/components/ui/AnimatedTextField";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { useIsWideWeb } from "@/hooks/useIsWideWeb";
import { clearLastAccount, getLastAccount, type LastAccount } from "@/lib/lastAccount";
import { getInitials } from "@/lib/initials";
import { colors, radius, shadows, spacing, typography, webShell } from "@/constants/theme";

export default function LoginScreen() {
  const { session, signIn } = useAuth();
  const isWideWeb = useIsWideWeb();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [lastAccount, setLastAccount] = useState<LastAccount | null>(null);
  const passwordRef = useRef<TextInput>(null);

  useEffect(() => {
    getLastAccount().then(setLastAccount);
  }, []);

  const canSubmit = email.trim().length > 3 && password.length >= 6 && !submitting;

  function handleQuickLogin() {
    if (!lastAccount) return;
    setEmail(lastAccount.email);
    passwordRef.current?.focus();
  }

  async function handleForgetAccount() {
    await clearLastAccount();
    setLastAccount(null);
  }

  async function handleSubmit() {
    if (!canSubmit) return;
    setError(null);
    setSubmitting(true);
    try {
      await signIn(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Giriş yapılamadı.");
    } finally {
      setSubmitting(false);
    }
  }

  if (session) return <Redirect href="/" />;

  return (
    <ScreenContainer background="vivid">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isWideWeb && styles.scrollContentWide]}
          keyboardShouldPersistTaps="handled"
        >
          <AnimatedFadeIn offsetY={12}>
            <View style={styles.header}>
              <AnimatedLogo icon="restaurant" size={64} />
              <Text style={styles.title}>OfisNow</Text>
              <Text style={styles.subtitle}>Kurumsal sipariş sistemine giriş yapın</Text>
            </View>
          </AnimatedFadeIn>

          <View style={styles.form}>
            {lastAccount && email.trim().length === 0 ? (
              <AnimatedFadeIn delay={80} offsetY={10}>
                <Pressable style={styles.quickLoginCard} onPress={handleQuickLogin}>
                  {lastAccount.avatarUrl ? (
                    <Image source={{ uri: lastAccount.avatarUrl }} style={styles.quickLoginAvatarImage} />
                  ) : (
                    <View style={styles.quickLoginAvatar}>
                      <Text style={styles.quickLoginAvatarText}>{getInitials(lastAccount.fullName)}</Text>
                    </View>
                  )}
                  <View style={styles.quickLoginTextGroup}>
                    <Text style={styles.quickLoginName} numberOfLines={1}>
                      {lastAccount.fullName}
                    </Text>
                    <Text style={styles.quickLoginHint} numberOfLines={1}>
                      Hızlı giriş için dokunun
                    </Text>
                  </View>
                  <Pressable onPress={handleForgetAccount} hitSlop={10} style={styles.quickLoginForget}>
                    <MaterialIcons name="close" size={18} color={colors.outline} />
                  </Pressable>
                </Pressable>
              </AnimatedFadeIn>
            ) : null}

            <AnimatedFadeIn delay={120} offsetY={10}>
              <AnimatedTextField
                label="E-posta"
                icon="email"
                value={email}
                onChangeText={setEmail}
                placeholder="ornek@sirket.com"
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
              />
            </AnimatedFadeIn>

            <AnimatedFadeIn delay={180} offsetY={10}>
              <AnimatedTextField
                ref={passwordRef}
                label="Şifre"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                placeholder="••••••••"
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textContentType="password"
                onSubmitEditing={handleSubmit}
                returnKeyType="go"
                rightElement={
                  <MaterialIcons
                    name={showPassword ? "visibility-off" : "visibility"}
                    size={20}
                    color={colors.outline}
                    onPress={() => setShowPassword((v) => !v)}
                    suppressHighlighting
                  />
                }
              />
            </AnimatedFadeIn>

            <AnimatedErrorBanner message={error} />

            <AnimatedFadeIn delay={220} offsetY={10} style={{ gap: spacing.md }}>
              <Pressable onPress={() => router.push("/forgot-password")} hitSlop={8} style={styles.forgotLink}>
                <Text style={styles.registerLinkText}>Şifreni mi unuttun?</Text>
              </Pressable>

              <Button
                label={submitting ? "Giriş yapılıyor..." : "GİRİŞ YAP"}
                onPress={handleSubmit}
                disabled={!canSubmit}
                loading={submitting}
                style={{ marginTop: spacing.sm }}
              />

              <Pressable onPress={() => router.push("/register")} hitSlop={8} style={styles.registerLink}>
                <Text style={styles.registerLinkText}>Hesabın yok mu? Kayıt ol</Text>
              </Pressable>
            </AnimatedFadeIn>
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
  scrollContentWide: {
    width: "100%",
    maxWidth: webShell.maxWidth,
    alignSelf: "center",
  },
  header: {
    alignItems: "center",
    gap: spacing.sm,
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
  quickLoginCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  quickLoginAvatar: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  quickLoginAvatarText: {
    ...typography.headlineSm,
    color: "#ffffff",
  },
  quickLoginAvatarImage: {
    width: 44,
    height: 44,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainer,
  },
  quickLoginTextGroup: {
    flex: 1,
    gap: 2,
  },
  quickLoginName: {
    ...typography.bodyLg,
    fontWeight: "700",
    color: colors.onSurface,
  },
  quickLoginHint: {
    ...typography.labelMd,
    color: colors.primary,
  },
  quickLoginForget: {
    padding: spacing.xs,
  },
  forgotLink: {
    alignItems: "flex-end",
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
