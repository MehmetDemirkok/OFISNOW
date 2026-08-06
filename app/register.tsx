import { useEffect, useRef, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { Redirect, router, useLocalSearchParams } from "expo-router";

import { AnimatedErrorBanner } from "@/components/ui/AnimatedErrorBanner";
import { AnimatedFadeIn } from "@/components/ui/AnimatedFadeIn";
import { AnimatedLogo } from "@/components/ui/AnimatedLogo";
import { AnimatedTextField } from "@/components/ui/AnimatedTextField";
import { Button } from "@/components/ui/Button";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { useIsWideWeb } from "@/hooks/useIsWideWeb";
import { showAlert } from "@/lib/alert";
import { colors, radius, spacing, typography, webShell } from "@/constants/theme";

type Mode = "create" | "join";
type JoinRole = "employee" | "waiter";

const JOIN_ROLE_LABEL: Record<JoinRole, string> = {
  employee: "Çalışan",
  waiter: "Görevli",
};

const PILL_PADDING = 4;
const PILL_GAP = 4;

export default function RegisterScreen() {
  const { session, signUp } = useAuth();
  const isWideWeb = useIsWideWeb();
  // E-posta ile gönderilen davet bağlantısı ?invite=TOKEN&role=employee|waiter
  // ile açılır; bu durumda "Davet Koduyla Katıl" sekmesi ve alanları önceden doldurulur.
  const params = useLocalSearchParams<{ invite?: string; role?: string }>();
  const invitedCode = typeof params.invite === "string" ? params.invite : "";
  const invitedRole: JoinRole = params.role === "waiter" ? "waiter" : "employee";

  const [mode, setMode] = useState<Mode>(invitedCode ? "join" : "create");
  const [switchWidth, setSwitchWidth] = useState(0);
  const modeAnim = useRef(new Animated.Value(0)).current;

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [inviteCode, setInviteCode] = useState(invitedCode);
  const [joinRole, setJoinRole] = useState<JoinRole>(invitedRole);
  const [locationDescription, setLocationDescription] = useState("");

  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    Animated.spring(modeAnim, {
      toValue: mode === "create" ? 0 : 1,
      speed: 16,
      bounciness: 10,
      useNativeDriver: false,
    }).start();
  }, [mode, modeAnim]);

  // E-postadaki davet linki web'e açılır (uygulama yüklü olmayanlar için tek
  // güvenli hedef budur). Web'de bu sayfa yüklenir yüklenmez, aynı daveti
  // taşıyan özel şema linkiyle uygulamayı da açmayı dener; uygulama kuruluysa
  // işletim sistemi devralır, kurulu değilse hiçbir şey olmaz ve kullanıcı
  // zaten bu sayfada (web'deki kayıt formunda) kalmaya devam eder.
  useEffect(() => {
    if (Platform.OS !== "web" || typeof window === "undefined" || !invitedCode) return;
    const query = new URLSearchParams({ invite: invitedCode, role: invitedRole }).toString();
    window.location.href = `ofisnow://register?${query}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const baseValid =
    fullName.trim().length > 1 && email.trim().length > 3 && password.length >= 6 && !submitting;
  const needsLocation = mode === "join" && joinRole === "employee";
  const canSubmit =
    mode === "create"
      ? baseValid && companyName.trim().length > 1
      : baseValid &&
        inviteCode.trim().length >= 4 &&
        (!needsLocation || locationDescription.trim().length > 0);

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
          : joinRole === "employee"
            ? {
                mode: "join",
                inviteCode: inviteCode.trim(),
                role: "employee",
                locationDescription: locationDescription.trim(),
              }
            : { mode: "join", inviteCode: inviteCode.trim(), role: "waiter" }
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

  const pillWidth = switchWidth > 0 ? (switchWidth - PILL_PADDING * 2 - PILL_GAP) / 2 : 0;

  return (
    <ScreenContainer background="vivid">
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[styles.scrollContent, isWideWeb && styles.scrollContentWide]}
          keyboardShouldPersistTaps="handled"
        >
          <AnimatedFadeIn offsetY={12}>
            <View style={styles.header}>
              <AnimatedLogo icon="person-add" size={64} />
              <Text style={styles.title}>Hesap Oluştur</Text>
              <Text style={styles.subtitle}>Yeni bir şirket kur ya da bir davet koduyla ekibe katıl</Text>
            </View>
          </AnimatedFadeIn>

          <AnimatedFadeIn delay={80} offsetY={10}>
            <View
              style={styles.modeSwitch}
              onLayout={(e) => setSwitchWidth(e.nativeEvent.layout.width)}
            >
              {pillWidth > 0 ? (
                <Animated.View
                  style={[
                    styles.modeSwitchPill,
                    {
                      width: pillWidth,
                      left: modeAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [PILL_PADDING, PILL_PADDING + pillWidth + PILL_GAP],
                      }),
                    },
                  ]}
                />
              ) : null}
              <Pressable style={styles.modeButton} onPress={() => setMode("create")}>
                <MaterialIcons
                  name="business"
                  size={18}
                  color={mode === "create" ? "#ffffff" : colors.onSurfaceVariant}
                />
                <Text style={[styles.modeButtonText, mode === "create" && styles.modeButtonTextActive]}>
                  Yeni Şirket Kur
                </Text>
              </Pressable>
              <Pressable style={styles.modeButton} onPress={() => setMode("join")}>
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
          </AnimatedFadeIn>

          <View style={styles.form}>
            <AnimatedFadeIn delay={140} offsetY={10}>
              <AnimatedTextField
                label="Ad Soyad"
                icon="person"
                value={fullName}
                onChangeText={setFullName}
                placeholder="Ad Soyad"
                autoComplete="name"
                textContentType="name"
              />
            </AnimatedFadeIn>

            <AnimatedFadeIn delay={180} offsetY={10}>
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

            <AnimatedFadeIn delay={220} offsetY={10}>
              <AnimatedTextField
                label="Şifre"
                icon="lock"
                value={password}
                onChangeText={setPassword}
                placeholder="En az 6 karakter"
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
                returnKeyType="next"
              />
            </AnimatedFadeIn>

            <AnimatedFadeIn key={mode} delay={0} offsetY={10}>
              {mode === "create" ? (
                <View style={styles.inputGroup}>
                  <AnimatedTextField
                    label="Şirket Adı"
                    icon="business"
                    value={companyName}
                    onChangeText={setCompanyName}
                    placeholder="Şirketinizin adı"
                    onSubmitEditing={handleSubmit}
                    returnKeyType="go"
                  />
                  <Text style={styles.hint}>
                    Şirketi ilk sen kuruyorsun — görevli olarak başlarsın; katalog, sipariş paneli ve ekip daveti sende olur. Ofis çalışanlarını davet ederek sipariş vermelerini sağlarsın.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: spacing.md }}>
                  <View style={styles.inputGroup}>
                    <AnimatedTextField
                      label="Hangi Şirkete Katılıyorsun?"
                      icon="vpn-key"
                      value={inviteCode}
                      onChangeText={(v) => setInviteCode(v.toUpperCase())}
                      placeholder="Davet Kodu, örn. F9FBB192"
                      autoCapitalize="characters"
                      onSubmitEditing={handleSubmit}
                      returnKeyType="go"
                    />
                    <Text style={styles.hint}>
                      Şirketindeki bir görevli veya çalışandan aldığın davet kodunu gir — hangi şirkete katıldığını
                      bu kod belirler.
                    </Text>
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
                    <Text style={styles.hint}>
                      {joinRole === "waiter"
                        ? "Görevli seçersen kaydolur kaydolmaz doğrudan görevli ekranıyla başlarsın."
                        : "Çalışan seçersen sipariş vermek için ana ekranı kullanırsın."}
                    </Text>
                  </View>

                  {needsLocation ? (
                    <AnimatedFadeIn offsetY={8}>
                      <View style={styles.inputGroup}>
                        <AnimatedTextField
                          label="Oda Tarifin"
                          icon="meeting-room"
                          value={locationDescription}
                          onChangeText={setLocationDescription}
                          placeholder="Örn. 3. kat, mutfağın karşısı, mavi kapı"
                          multiline
                        />
                        <Text style={styles.hint}>
                          Sipariş verirken ve görevli çağırırken bu tarif kullanılır.
                        </Text>
                      </View>
                    </AnimatedFadeIn>
                  ) : null}
                </View>
              )}
            </AnimatedFadeIn>

            <AnimatedErrorBanner message={error} />

            <AnimatedFadeIn offsetY={10} style={{ gap: spacing.md }}>
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
    gap: spacing.lg,
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
  modeSwitch: {
    flexDirection: "row",
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    padding: PILL_PADDING,
    gap: PILL_GAP,
    position: "relative",
  },
  modeSwitchPill: {
    position: "absolute",
    top: PILL_PADDING,
    bottom: PILL_PADDING,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
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
  loginLink: {
    alignItems: "center",
    marginTop: spacing.xs,
  },
  loginLinkText: {
    ...typography.bodyMd,
    color: colors.primary,
  },
});
