import { useRef, useState } from "react";
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
import { useCart } from "@/context/CartContext";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { createOrder } from "@/lib/api/orders";
import { showAlert } from "@/lib/alert";
import { safeGoBack } from "@/lib/navigation";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";
import type { CartItemInput } from "@/types/database";

export default function NewOrderScreen() {
  const { profile } = useAuth();
  const { lines, increment, decrement, setSpecialRequest, clear } = useCart();
  const isConnected = useNetworkStatus();

  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const myLocation = profile?.location_description?.trim() || null;

  const canSubmit = lines.length > 0 && !!myLocation && isConnected !== false && !submitting;

  async function handleSubmit() {
    if (!canSubmit || isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setSubmitting(true);
    setSubmitError(null);

    try {
      const items: CartItemInput[] = lines.map((line) => ({
        product_id: line.product.id,
        product_name: line.product.name,
        quantity: line.quantity,
        special_request: line.specialRequest.trim() || null,
      }));

      await createOrder({
        note: note.trim() || null,
        items,
      });

      clear();
      showAlert("Siparişiniz alındı", "Siparişiniz görevlilere iletildi.", [
        { text: "Tamam", onPress: () => router.replace("/(employee)") },
      ]);
    } catch (err) {
      setSubmitError(toFriendlyErrorMessage(err));
    } finally {
      isSubmittingRef.current = false;
      setSubmitting(false);
    }
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => safeGoBack("/(employee)")} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={22} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Siparişi Tamamla</Text>
        <View style={{ width: 40 }} />
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sepetiniz</Text>
            {lines.map((line) => (
              <View key={line.product.id} style={styles.cartLine}>
                <View style={styles.cartLineHeader}>
                  <Text style={styles.cartLineName}>
                    {line.quantity}x {line.product.name}
                  </Text>
                  <View style={styles.cartLineButtons}>
                    <Pressable onPress={() => decrement(line.product.id)} hitSlop={8}>
                      <MaterialIcons name="remove-circle-outline" size={22} color={colors.outline} />
                    </Pressable>
                    <Text style={styles.cartLineQty}>{line.quantity}</Text>
                    <Pressable onPress={() => increment(line.product)} hitSlop={8}>
                      <MaterialIcons name="add-circle" size={22} color={colors.primary} />
                    </Pressable>
                  </View>
                </View>
                <TextInput
                  style={styles.specialInput}
                  value={line.specialRequest}
                  onChangeText={(text) => setSpecialRequest(line.product.id, text)}
                  placeholder="Özel istek ekle (örn. Şekersiz)"
                  placeholderTextColor={colors.outline}
                />
              </View>
            ))}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Teslimat Konumu</Text>
            {myLocation ? (
              <View style={styles.locationBox}>
                <MaterialIcons name="location-on" size={20} color={colors.primary} />
                <Text style={styles.locationText}>{myLocation}</Text>
              </View>
            ) : (
              <View style={styles.locationWarning}>
                <MaterialIcons name="error-outline" size={20} color={colors.error} />
                <Text style={styles.locationWarningText}>
                  Konum bilginiz eksik. Sipariş verebilmek için sağ üstteki hesap rozetinden kat/oda
                  bilginizi girin.
                </Text>
              </View>
            )}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Not (opsiyonel)</Text>
            <TextInput
              style={styles.noteInput}
              value={note}
              onChangeText={setNote}
              placeholder="Örn: Lütfen toplantı odasına bırakın."
              placeholderTextColor={colors.outline}
              multiline
            />
          </View>

          {submitError ? (
            <View style={styles.errorBox}>
              <MaterialIcons name="error-outline" size={18} color={colors.error} />
              <Text style={styles.errorText}>{submitError}</Text>
            </View>
          ) : null}

          <Button
            label={submitting ? "Gönderiliyor..." : "SİPARİŞİ GÖNDER"}
            onPress={handleSubmit}
            disabled={!canSubmit}
            loading={submitting}
            icon={<MaterialIcons name="send" size={20} color="#ffffff" />}
          />
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
  section: {
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  cartLine: {
    backgroundColor: colors.surfaceContainerLow,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.xs,
    ...shadows.sm,
  },
  cartLineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cartLineName: {
    ...typography.bodyLg,
    color: colors.onSurface,
    flex: 1,
  },
  cartLineButtons: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
  },
  cartLineQty: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    minWidth: 16,
    textAlign: "center",
  },
  specialInput: {
    height: 40,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  noteInput: {
    minHeight: 72,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    padding: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    textAlignVertical: "top",
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  locationBox: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.primaryFixed,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  locationText: {
    ...typography.bodyLg,
    fontWeight: "600",
    color: colors.primary,
  },
  locationWarning: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: spacing.sm,
    backgroundColor: colors.errorContainer,
    borderRadius: radius.md,
    padding: spacing.md,
  },
  locationWarningText: {
    ...typography.bodyMd,
    color: colors.onErrorContainer,
    flex: 1,
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
});
