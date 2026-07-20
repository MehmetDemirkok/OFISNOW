import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchMyCompany, regenerateInviteCode } from "@/lib/api/company";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, spacing, typography } from "@/constants/theme";

export function InviteCodeCard() {
  const { data: company, loading, refetch } = useAsyncData(fetchMyCompany, []);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  async function handleCopy() {
    if (!company) return;
    await Clipboard.setStringAsync(company.invite_code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  function handleRegenerate() {
    showAlert(
      "Yeni Davet Kodu",
      "Eski davet kodu artık çalışmaz. Yeni kodu ekibinizle paylaşmanız gerekecek. Devam edilsin mi?",
      [
        { text: "Vazgeç", style: "cancel" },
        {
          text: "Yeni Kod Oluştur",
          style: "destructive",
          onPress: async () => {
            setRegenerating(true);
            try {
              await regenerateInviteCode();
              refetch();
            } catch (err) {
              showAlert("Hata", toFriendlyErrorMessage(err));
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  }

  if (loading || !company) {
    return (
      <View style={[styles.card, styles.loadingCard]}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.iconBadge}>
          <MaterialIcons name="business" size={20} color={colors.primary} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.companyName} numberOfLines={1}>
            {company.name}
          </Text>
          <Text style={styles.caption}>Ekibini davet etmek için bu kodu paylaş</Text>
        </View>
      </View>

      <View style={styles.codeRow}>
        <View style={styles.codeBox}>
          <Text style={styles.codeText}>{company.invite_code}</Text>
        </View>
        <Pressable style={styles.iconButton} onPress={handleCopy} hitSlop={8}>
          <MaterialIcons
            name={copied ? "check" : "content-copy"}
            size={20}
            color={copied ? colors.success : colors.primary}
          />
        </Pressable>
        <Pressable style={styles.iconButton} onPress={handleRegenerate} disabled={regenerating} hitSlop={8}>
          {regenerating ? (
            <ActivityIndicator size="small" color={colors.primary} />
          ) : (
            <MaterialIcons name="refresh" size={20} color={colors.onSurfaceVariant} />
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primaryFixed,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.sm,
  },
  loadingCard: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 88,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: {
    ...typography.bodyLg,
    fontWeight: "700",
    color: colors.primary,
  },
  caption: {
    ...typography.labelMd,
    color: colors.primary,
    opacity: 0.8,
  },
  codeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  codeBox: {
    flex: 1,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  codeText: {
    ...typography.headlineSm,
    letterSpacing: 2,
    color: colors.onSurface,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
});
