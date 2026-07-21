import { useState } from "react";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { AdminListRow } from "@/components/admin/AdminListRow";
import { AdminScreenHeader } from "@/components/admin/AdminScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { createCategory, deleteCategory, fetchAllCategories, updateCategory } from "@/lib/api/catalog";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, spacing, typography } from "@/constants/theme";
import type { Category } from "@/types/database";

export default function AdminCategoriesScreen() {
  const { data: categories, loading, error, refetch } = useAsyncData(fetchAllCategories, []);

  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const isEdit = !!editingCategory;
  const canSave = name.trim().length > 0 && !saving;

  async function handleToggle(id: string, value: boolean) {
    try {
      await updateCategory(id, { is_active: value });
      refetch();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    }
  }

  function openAddModal() {
    setEditingCategory(null);
    setName("");
    setSortOrder(String((categories?.length ?? 0) + 1));
    setIsActive(true);
    setModalVisible(true);
  }

  function openEditModal(category: Category) {
    setEditingCategory(category);
    setName(category.name);
    setSortOrder(String(category.sort_order));
    setIsActive(category.is_active);
    setModalVisible(true);
  }

  function closeModal() {
    setModalVisible(false);
    setEditingCategory(null);
  }

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const parsedSort = Number(sortOrder) || 0;
      if (isEdit) {
        await updateCategory(editingCategory.id, { name: name.trim(), sort_order: parsedSort, is_active: isActive });
      } else {
        await createCategory({ name: name.trim(), sort_order: parsedSort });
      }
      closeModal();
      refetch();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleDelete(category: Category) {
    showAlert("Kategoriyi Sil", `"${category.name}" kategorisini silmek istediğinize emin misiniz?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(category.id);
            refetch();
          } catch (err) {
            showAlert("Hata", toFriendlyErrorMessage(err));
          }
        },
      },
    ]);
  }

  return (
    <ScreenContainer>
      <AdminScreenHeader title="Kategoriler" onAdd={openAddModal} />

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={categories ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={<EmptyState icon="list-alt" title="Henüz kategori eklenmemiş" />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.name}
              subtitle={`Sıra: ${item.sort_order}`}
              isActive={item.is_active}
              onToggleActive={(value) => handleToggle(item.id, value)}
              onEdit={() => openEditModal(item)}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{isEdit ? "Kategoriyi Düzenle" : "Yeni Kategori"}</Text>

            <View style={styles.field}>
              <Text style={styles.label}>Kategori Adı</Text>
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Sıcak İçecekler"
                placeholderTextColor={colors.outline}
                autoFocus
              />
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

            <View style={styles.modalButtonRow}>
              <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={closeModal} disabled={saving}>
                <Text style={styles.modalButtonTextCancel}>Vazgeç</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, !canSave && styles.modalButtonDisabled]}
                onPress={handleSave}
                disabled={!canSave}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>{isEdit ? "Kaydet" : "Ekle"}</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  modalCard: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.md,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  modalTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: "center",
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
  modalButtonRow: {
    flexDirection: "row",
    gap: spacing.sm,
  },
  modalButton: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  modalButtonCancel: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  modalButtonPrimary: {
    backgroundColor: colors.primary,
  },
  modalButtonDisabled: {
    opacity: 0.5,
  },
  modalButtonTextCancel: {
    ...typography.bodyMd,
    fontWeight: "700",
    color: colors.onSurfaceVariant,
  },
  modalButtonTextPrimary: {
    ...typography.bodyMd,
    fontWeight: "700",
    color: "#ffffff",
  },
});
