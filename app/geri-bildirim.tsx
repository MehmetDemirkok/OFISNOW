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
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAuth } from "@/context/AuthContext";
import { sendFeedback } from "@/lib/api/feedback";
import { showAlert } from "@/lib/alert";
import { safeGoBack } from "@/lib/navigation";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";
import type { FeedbackCategory } from "@/types/database";

const CATEGORIES: { value: FeedbackCategory; label: string; icon: React.ComponentProps<typeof MaterialIcons>["name"] }[] = [
  { value: "suggestion", label: "Öneri", icon: "lightbulb" },
  { value: "bug", label: "Hata Bildirimi", icon: "bug-report" },
  { value: "complaint", label: "Şikayet", icon: "report-problem" },
  { value: "other", label: "Diğer", icon: "chat-bubble" },
];

const MIN_MESSAGE_LENGTH = 10;

export default function FeedbackScreen() {
  const { profile } = useAuth();
  const [category, setCategory] = useState<FeedbackCategory>("suggestion");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  if (!profile) return null;

  const fallbackHref = profile.role === "waiter" ? "/(waiter)" : "/(employee)";
  const canSend = message.trim().length >= MIN_MESSAGE_LENGTH && !sending;

  async function handleSend() {
    if (!canSend) return;

    setSending(true);
    try {
      await sendFeedback({ message: message.trim(), category });
      setMessage("");
      showAlert("Teşekkürler!", "Geri bildiriminiz bize ulaştı. Görüşleriniz için teşekkür ederiz.", [
        { text: "Tamam", onPress: () => safeGoBack(fallbackHref) },
      ]);
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setSending(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => safeGoBack(fallbackHref)} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Geri Bildirim</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.infoCard}>
            <View style={styles.infoIconCircle}>
              <MaterialIcons name="feedback" size={20} color={colors.success} />
            </View>
            <Text style={styles.infoText}>
              OfisNow'u geliştirmemize yardımcı olun. Buradan gönderdiğiniz her mesaj doğrudan ekibimize e-posta
              olarak iletilir; öneri, hata bildirimi veya şikayetlerinizi bekliyoruz.
            </Text>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Konu</Text>
            <View style={styles.categoryRow}>
              {CATEGORIES.map((item) => {
                const isSelected = category === item.value;
                return (
                  <Pressable
                    key={item.value}
                    style={[styles.categoryChip, isSelected && styles.categoryChipSelected]}
                    onPress={() => setCategory(item.value)}
                  >
                    <MaterialIcons
                      name={item.icon}
                      size={16}
                      color={isSelected ? "#ffffff" : colors.onSurfaceVariant}
                    />
                    <Text style={[styles.categoryChipText, isSelected && styles.categoryChipTextSelected]}>
                      {item.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Mesajınız</Text>
            <View style={styles.card}>
              <TextInput
                style={styles.textArea}
                value={message}
                onChangeText={setMessage}
                placeholder="Görüşlerinizi, önerilerinizi veya karşılaştığınız sorunu buraya yazın..."
                placeholderTextColor={colors.outline}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
              />
            </View>
            <Text style={styles.hint}>
              {message.trim().length < MIN_MESSAGE_LENGTH
                ? `En az ${MIN_MESSAGE_LENGTH} karakter yazın.`
                : `${message.trim().length} karakter`}
            </Text>
          </View>

          <Button label={sending ? "Gönderiliyor..." : "Gönder"} onPress={handleSend} disabled={!canSend} loading={sending} />
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
    backgroundColor: colors.successContainer,
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
  categoryRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  categoryChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.surfaceContainerLow,
  },
  categoryChipSelected: {
    backgroundColor: colors.primary,
  },
  categoryChipText: {
    ...typography.labelLg,
    textTransform: "none",
    letterSpacing: 0,
    color: colors.onSurfaceVariant,
  },
  categoryChipTextSelected: {
    color: "#ffffff",
    fontWeight: "700",
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    ...shadows.sm,
    padding: spacing.md,
  },
  textArea: {
    minHeight: 140,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  hint: {
    ...typography.labelMd,
    color: colors.outline,
  },
});
