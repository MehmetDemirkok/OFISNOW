import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { Alert, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { createCategory, fetchCategoryById, updateCategory } from "@/lib/api/catalog";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function CategoryFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const { data: existing, loading } = useAsyncData(
    () => (isEdit ? fetchCategoryById(id) : Promise.resolve(null)),
    [id]
  );

  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setSortOrder(String(existing.sort_order));
      setIsActive(existing.is_active);
    }
  }, [existing]);

  const canSave = name.trim().length > 0 && !saving;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const parsedSort = Number(sortOrder) || 0;
      if (isEdit) {
        await updateCategory(id, { name: name.trim(), sort_order: parsedSort, is_active: isActive });
      } else {
        await createCategory({ name: name.trim(), sort_order: parsedSort });
      }
      router.back();
    } catch (err) {
      Alert.alert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <ScreenContainer>
        <LoadingView />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <MaterialIcons name="close" size={24} color={colors.onSurface} />
        </Pressable>
        <Text style={styles.title}>{isEdit ? "Kategoriyi Düzenle" : "Yeni Kategori"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Kategori Adı</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Sıcak İçecekler" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Sıra</Text>
          <TextInput
            style={styles.input}
            value={sortOrder}
            onChangeText={setSortOrder}
            keyboardType="number-pad"
          />
        </View>

        {isEdit ? (
          <View style={styles.switchRow}>
            <Text style={styles.label}>Aktif</Text>
            <Switch
              value={isActive}
              onValueChange={setIsActive}
              trackColor={{ false: colors.outlineVariant, true: colors.primary }}
            />
          </View>
        ) : null}

        <Button label={saving ? "Kaydediliyor..." : "KAYDET"} onPress={handleSave} disabled={!canSave} loading={saving} />
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
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
    paddingBottom: spacing.xl,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    ...typography.labelLg,
    color: colors.onSurfaceVariant,
    textTransform: "none",
    letterSpacing: 0,
  },
  input: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.bodyLg,
    color: colors.onSurface,
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
