import { MaterialIcons } from "@expo/vector-icons";
import * as Linking from "expo-linking";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { safeGoBack } from "@/lib/navigation";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";

const SUPPORT_EMAIL = "mehmetdemirkok@gmail.com";
const LAST_UPDATED = "2 Ağustos 2026";

const SECTIONS = [
  {
    title: "Topladığımız Veriler",
    body:
      "Hesabınızı oluştururken e-posta adresinizi ve şifrenizi; profilinizde ad soyad, ünvan, doğum tarihi ve isterseniz bir profil fotoğrafını topluyoruz. Uygulama içinde verdiğiniz çay, kahve ve ikram siparişlerinin içeriği, zamanı ve durumu kaydedilir. Anlık bildirim gönderebilmek için cihazınıza ait bildirim (push) belirtecini saklarız.",
  },
  {
    title: "Verileri Neden Topluyoruz",
    body:
      "Bu veriler yalnızca hesabınızı oluşturmak, oturum açmanızı sağlamak, siparişlerinizi ilgili görevli veya garsona iletmek, sipariş durumunu size anlık bildirimle ulaştırmak ve kurum içi raporlama yapmak için kullanılır. Reklam veya pazarlama amacıyla kullanılmaz.",
  },
  {
    title: "Verilerin Saklanması",
    body:
      "Verileriniz altyapı sağlayıcımız Supabase üzerinde şifreli olarak saklanır. Bildirimler Apple'ın APNs servisi üzerinden iletilir. Uygulamada reklam ağı veya üçüncü taraf analitik/izleme yazılımı kullanılmaz; verileriniz pazarlama amacıyla üçüncü taraflarla paylaşılmaz veya satılmaz.",
  },
  {
    title: "Saklama Süresi",
    body:
      "Verileriniz hesabınız aktif olduğu sürece saklanır. Hesabınızın silinmesini talep etmeniz halinde kişisel verileriniz makul bir süre içinde sistemlerimizden kalıcı olarak silinir.",
  },
  {
    title: "Haklarınız",
    body:
      "6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) kapsamında verilerinize erişme, düzeltilmesini veya silinmesini talep etme ve işlenmesine itiraz etme hakkına sahipsiniz. Bu haklarınızı kullanmak için aşağıdaki e-posta adresinden bize ulaşabilirsiniz.",
  },
];

export default function PrivacyPolicyScreen() {
  const { profile } = useAuth();
  const fallbackHref = profile?.role === "waiter" ? "/(waiter)" : "/(employee)";

  function handleContactPress() {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("İkram X Gizlilik")}`);
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => safeGoBack(fallbackHref)} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Gizlilik Politikası</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.intro}>
          İkram X ("uygulama"), ofis ve şirketlerde çay, kahve ve ikram siparişi yönetimi sağlayan kurumsal bir
          uygulamadır. Bu sayfa uygulamayı kullanırken hangi kişisel verilerinizi topladığımızı ve nasıl
          kullandığımızı açıklar.
        </Text>

        {SECTIONS.map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <View style={styles.card}>
              <Text style={styles.sectionBody}>{section.body}</Text>
            </View>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bize Ulaşın</Text>
          <Pressable style={styles.contactRow} onPress={handleContactPress}>
            <View style={styles.contactIconCircle}>
              <MaterialIcons name="email" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>E-posta ile İletişim</Text>
              <Text style={styles.contactValue}>{SUPPORT_EMAIL}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
          </Pressable>
        </View>

        <Text style={styles.versionText}>Son güncelleme: {LAST_UPDATED}</Text>
      </ScrollView>
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
  intro: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  section: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.sm,
    padding: spacing.md,
  },
  sectionBody: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    ...shadows.sm,
  },
  contactIconCircle: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  contactLabel: {
    ...typography.bodyLg,
    fontWeight: "600",
    color: colors.onSurface,
  },
  contactValue: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  versionText: {
    ...typography.labelMd,
    color: colors.outline,
    textAlign: "center",
    marginTop: spacing.sm,
  },
});
