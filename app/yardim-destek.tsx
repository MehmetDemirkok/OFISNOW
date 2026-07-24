import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import Constants from "expo-constants";
import * as Linking from "expo-linking";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { safeGoBack } from "@/lib/navigation";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";

const SUPPORT_EMAIL = "mehmetdemirkok@gmail.com";

const FAQ_ITEMS = [
  {
    question: "Sipariş verdikten sonra ne olur?",
    answer:
      "Siparişiniz anında görevlilere iletilir. Görevli siparişinizi gördüğünde durumu güncellenir, hazır olduğunda size bildirim gider.",
  },
  {
    question: "Bildirim gelmiyor, ne yapmalıyım?",
    answer:
      "Hesap Ayarları > Bildirimler bölümünden bildirimleri etkinleştirdiğinizden emin olun. Tarayıcı bildirimleri engellediyse adres çubuğundaki site ayarlarından izin vermeniz gerekir.",
  },
  {
    question: "Şifremi unuttum, nasıl sıfırlarım?",
    answer:
      "Giriş ekranındaki \"Şifremi Unuttum\" bağlantısını kullanarak e-postanıza gelecek kodla yeni bir şifre belirleyebilirsiniz.",
  },
  {
    question: "Profil bilgilerimi nasıl güncellerim?",
    answer: "Hesabım sekmesinden Bilgilerim'e girip ad, ünvan, doğum tarihi ve fotoğrafınızı güncelleyebilirsiniz.",
  },
];

function FaqRow({
  question,
  answer,
  isOpen,
  onPress,
  isLast,
}: {
  question: string;
  answer: string;
  isOpen: boolean;
  onPress: () => void;
  isLast: boolean;
}) {
  return (
    <View style={!isLast && styles.faqDivider}>
      <Pressable style={styles.faqHeader} onPress={onPress}>
        <Text style={styles.faqQuestion}>{question}</Text>
        <MaterialIcons name={isOpen ? "expand-less" : "expand-more"} size={22} color={colors.outline} />
      </Pressable>
      {isOpen ? <Text style={styles.faqAnswer}>{answer}</Text> : null}
    </View>
  );
}

export default function HelpSupportScreen() {
  const { profile } = useAuth();
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  if (!profile) return null;

  const fallbackHref = profile.role === "waiter" ? "/(waiter)" : "/(employee)";
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  function handleContactPress() {
    Linking.openURL(`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("OfisNow Destek")}`);
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => safeGoBack(fallbackHref)} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Yardım ve Destek</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Sık Sorulan Sorular</Text>
          <View style={styles.card}>
            {FAQ_ITEMS.map((item, index) => (
              <FaqRow
                key={item.question}
                question={item.question}
                answer={item.answer}
                isOpen={openIndex === index}
                onPress={() => setOpenIndex(openIndex === index ? null : index)}
                isLast={index === FAQ_ITEMS.length - 1}
              />
            ))}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Bize Ulaşın</Text>
          <Pressable style={styles.contactRow} onPress={handleContactPress}>
            <View style={styles.contactIconCircle}>
              <MaterialIcons name="email" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.contactLabel}>E-posta ile Destek</Text>
              <Text style={styles.contactValue}>{SUPPORT_EMAIL}</Text>
            </View>
            <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
          </Pressable>
        </View>

        <Text style={styles.versionText}>OfisNow Sürüm {appVersion}</Text>
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
    paddingHorizontal: spacing.md,
  },
  faqDivider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.outlineVariant,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: spacing.sm,
    paddingVertical: spacing.md,
  },
  faqQuestion: {
    flex: 1,
    ...typography.bodyLg,
    fontWeight: "600",
    color: colors.onSurface,
  },
  faqAnswer: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    paddingBottom: spacing.md,
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
