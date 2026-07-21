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
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { LocationPicker, OTHER_VALUE } from "@/components/employee/LocationPicker";
import { useCart } from "@/context/CartContext";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { fetchLocations } from "@/lib/api/catalog";
import { createOrder } from "@/lib/api/orders";
import { showAlert } from "@/lib/alert";
import { safeGoBack } from "@/lib/navigation";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, spacing, typography } from "@/constants/theme";
import type { CartItemInput } from "@/types/database";

export default function NewOrderScreen() {
  const { lines, increment, decrement, setSpecialRequest, clear } = useCart();
  const { data: locations, loading, error, refetch } = useAsyncData(fetchLocations, []);
  const isConnected = useNetworkStatus();

  const [selectedLocationId, setSelectedLocationId] = useState<string | null>(null);
  const [customLocation, setCustomLocation] = useState("");
  const [note, setNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const isSubmittingRef = useRef(false);

  const hasLocation =
    (selectedLocationId && selectedLocationId !== OTHER_VALUE) ||
    (selectedLocationId === OTHER_VALUE && customLocation.trim().length > 0);

  const canSubmit = lines.length > 0 && hasLocation && isConnected !== false && !submitting;

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
        locationId: selectedLocationId === OTHER_VALUE ? null : selectedLocationId,
        customLocation: selectedLocationId === OTHER_VALUE ? customLocation.trim() : null,
        note: note.trim() || null,
        items,
      });

      clear();
      showAlert("Siparişiniz alındı", "Siparişiniz garsonlara iletildi.", [
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
        <Pressable onPress={() => safeGoBack("/(employee)")} hitSlop={12}>
          <MaterialIcons name="arrow-back" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>Siparişi Tamamla</Text>
        <View style={{ width: 24 }} />
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
            {loading ? (
              <LoadingView label="Konumlar yükleniyor..." />
            ) : error ? (
              <ErrorState message={error} onRetry={refetch} />
            ) : (
              <LocationPicker
                locations={locations ?? []}
                selectedId={selectedLocationId}
                customText={customLocation}
                onSelect={setSelectedLocationId}
                onCustomTextChange={setCustomLocation}
              />
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
    borderRadius: radius.md,
    padding: spacing.sm,
    gap: spacing.xs,
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
