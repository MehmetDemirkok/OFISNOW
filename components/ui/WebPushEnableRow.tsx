import { useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { ActivityIndicator, Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { useAuth } from "@/context/AuthContext";
import { useWebPushSubscription } from "@/hooks/useWebPushSubscription";
import { colors, radius, spacing, typography } from "@/constants/theme";

/**
 * Hesap menüsünde garson için "Bildirimleri Etkinleştir" satırı. İzin isteği
 * yalnızca bu butona tıklandığında tetiklenir (bkz. useWebPushSubscription
 * içindeki not: sayfa yüklenir yüklenmez otomatik istenen izinleri tarayıcılar
 * sessizce reddedebiliyor).
 */
export function WebPushEnableRow() {
  const { profile } = useAuth();
  const { status, requestAndSubscribe } = useWebPushSubscription(true);
  const [loading, setLoading] = useState(false);
  const [showDeniedHelp, setShowDeniedHelp] = useState(false);

  if (profile?.role !== "waiter") return null;
  if (status === "unsupported" || status === "unknown" || status === "granted") return null;

  async function handlePress() {
    if (status === "denied") {
      setShowDeniedHelp(true);
      return;
    }
    setLoading(true);
    try {
      await requestAndSubscribe();
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Pressable style={styles.row} onPress={handlePress} hitSlop={4} disabled={loading}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Bildirimleri Etkinleştir</Text>
          <Text style={styles.hint}>
            {status === "denied"
              ? "Tarayıcı bildirimleri engelledi, dokunup düzeltin"
              : "Ekran kilitliyken de sipariş bildirimi alın"}
          </Text>
        </View>
        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : (
          <MaterialIcons name={status === "denied" ? "notifications-off" : "notifications"} size={18} color={colors.primary} />
        )}
      </Pressable>

      <Modal visible={showDeniedHelp} transparent animationType="fade" onRequestClose={() => setShowDeniedHelp(false)}>
        <Pressable style={styles.backdrop} onPress={() => setShowDeniedHelp(false)}>
          <Pressable style={styles.card} onPress={(e) => e.stopPropagation()}>
            <View style={styles.iconBadge}>
              <MaterialIcons name="notifications-off" size={22} color="#ffffff" />
            </View>
            <Text style={styles.title}>Bildirimler Engellendi</Text>
            <Text style={styles.subtitle}>
              Tarayıcı bu site için bildirimleri engellemiş. Tekrar açmak için tarayıcının adres çubuğundaki kilit/site
              bilgisi simgesine dokunun, "Bildirimler" iznini "İzin Ver" olarak değiştirin ve sayfayı yenileyin.
            </Text>

            <Pressable style={styles.closeButton} onPress={() => setShowDeniedHelp(false)}>
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
