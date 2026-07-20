import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { Button } from "@/components/ui/Button";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import {
  createProduct,
  fetchAllCategories,
  fetchProductById,
  updateProduct,
} from "@/lib/api/catalog";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function ProductFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const { data: categories, loading: categoriesLoading } = useAsyncData(fetchAllCategories, []);
  const { data: existing, loading: existingLoading } = useAsyncData(
    () => (isEdit ? fetchProductById(id) : Promise.resolve(null)),
    [id]
  );

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setDescription(existing.description ?? "");
      setCategoryId(existing.category_id);
      setIsActive(existing.is_active);
    }
  }, [existing]);

  useEffect(() => {
    if (!isEdit && !categoryId && categories && categories.length > 0) {
      setCategoryId(categories[0].id);
    }
  }, [categories, categoryId, isEdit]);

  const canSave = name.trim().length > 0 && !!categoryId && !saving;

  async function handleSave() {
    if (!canSave || !categoryId) return;
    setSaving(true);
    try {
      if (isEdit) {
        await updateProduct(id, {
          name: name.trim(),
          description: description.trim() || null,
          category_id: categoryId,
          is_active: isActive,
        });
      } else {
        await createProduct({
          name: name.trim(),
          description: description.trim() || null,
          category_id: categoryId,
        });
      }
      router.back();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (existingLoading || categoriesLoading) {
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
        <Text style={styles.title}>{isEdit ? "Ürünü Düzenle" : "Yeni Ürün"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.field}>
          <Text style={styles.label}>Ürün Adı</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Türk Kahvesi" />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Açıklama</Text>
          <TextInput
            style={[styles.input, styles.multiline]}
            value={description}
            onChangeText={setDescription}
            placeholder="Kısa açıklama (opsiyonel)"
            multiline
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Kategori</Text>
          <View style={styles.chipRow}>
            {(categories ?? []).map((c) => (
              <Pressable
                key={c.id}
                onPress={() => setCategoryId(c.id)}
                style={[styles.chip, categoryId === c.id && styles.chipSelected]}
              >
                <Text style={[styles.chipText, categoryId === c.id && styles.chipTextSelected]}>
                  {c.name}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>Aktif</Text>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: colors.outlineVariant, true: colors.primary }}
          />
        </View>

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
  multiline: {
    height: 72,
    paddingTop: spacing.sm,
    textAlignVertical: "top",
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: spacing.sm,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  chipSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    ...typography.labelLg,
    color: colors.onSurface,
    textTransform: "none",
    letterSpacing: 0,
  },
  chipTextSelected: {
    color: "#ffffff",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
});
