import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { usePwaInstall } from "@/hooks/usePwaInstall";
import { colors, radius, spacing, typography } from "@/constants/theme";

const IOS_STEPS = [
  "Safari'de alt menüdeki Paylaş (kare + yukarı ok) simgesine dokunun.",
  "Açılan listede aşağı kaydırıp \"Ana Ekrana Ekle\" seçeneğine dokunun.",
  "Sağ üstteki \"Ekle\" ile onaylayın. OfisNow artık ana ekranınızda.",
];

const GENERIC_STEPS = [
  "Tarayıcının sağ üst köşesindeki menü (⋮) simgesine dokunun.",
  "\"Uygulamayı yükle\" ya da \"Ana ekrana ekle\" seçeneğine dokunun.",
  "Açılan onayda \"Yükle\" ile devam edin. OfisNow artık ana ekranınızda.",
];

/** Hesap menüsünde PWA'yı ana ekrana eklemek için satır + adım adım talimat modalı. */
export function PwaInstallRow() {
  const { isWeb, installed, canPromptInstall, isIos, promptInstall } = usePwaInstall();
  const [showInstructions, setShowInstructions] = useState(false);

  if (!isWeb || installed) return null;

  async function handlePress() {
    if (canPromptInstall) {
      await promptInstall();
      return;
    }
    setShowInstructions(true);
  }

  const steps = isIos ? IOS_STEPS : GENERIC_STEPS;

  return (
    <>
      <Pressable style={styles.row} onPress={handlePress} hitSlop={4}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Uygulamayı Yükle</Text>
          <Text style={styles.hint}>Ana ekrana ekleyin, tarayıcı olmadan açılsın</Text>
        </View>
        <MaterialIcons name="download" size={18} color={colors.primary} />
      </Pressable>

      <Modal visible={showInstructions} transparent animationType="fade" onRequestClose={() => setShowInstructions(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowInstructions(false)}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <View style={styles.iconBadge}>
              <MaterialIcons name="download" size={22} color="#ffffff" />
            </View>
            <Text style={styles.title}>Ana Ekrana Ekle</Text>
            <Text style={styles.subtitle}>
              OfisNow'u ana ekranınıza ekleyerek uygulama gibi, tarayıcı çubuğu olmadan kullanabilirsiniz.
            </Text>

            <View style={styles.steps}>
              {steps.map((step, index) => (
                <View key={step} style={styles.stepRow}>
                  <View style={styles.stepNumber}>
                    <Text style={styles.stepNumberText}>{index + 1}</Text>
                  </View>
                  <Text style={styles.stepText}>{step}</Text>
                </View>
              ))}
            </View>

            <Pressable style={styles.closeButton} onPress={() => setShowInstructions(false)}>
              <Text style={styles.closeText}>Anladım</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    width: "100%",
    backgroundColor: colors.surfaceContainer,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  label: {
    ...typography.bodyMd,
    color: colors.onSurface,
    fontWeight: "700",
  },
  hint: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 320,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: "center",
    gap: spacing.xs,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  iconBadge: {
    width: 48,
    height: 48,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.bodyLg,
    fontWeight: "700",
    color: colors.onSurface,
    textAlign: "center",
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: spacing.xs,
  },
  steps: {
    width: "100%",
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  stepNumber: {
    width: 22,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  stepNumberText: {
    ...typography.labelMd,
    color: colors.primary,
    fontWeight: "700",
  },
  stepText: {
    ...typography.bodyMd,
    color: colors.onSurface,
    flex: 1,
  },
  closeButton: {
    marginTop: spacing.sm,
    width: "100%",
    height: 44,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.surfaceContainerHigh,
  },
  closeText: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    fontWeight: "700",
  },
});
