import { useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { ActivityIndicator, FlatList, Modal, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AdminScreenHeader } from "@/components/admin/AdminScreenHeader";
import { LocationCard } from "@/components/admin/LocationCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { createLocation, deleteLocation, fetchAllLocations, updateLocation } from "@/lib/api/catalog";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function AdminLocationsScreen() {
  const { data: locations, loading, error, refetch } = useAsyncData(fetchAllLocations, []);
  const [query, setQuery] = useState("");
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [newLocationName, setNewLocationName] = useState("");
  const [savingNewLocation, setSavingNewLocation] = useState(false);

  const filteredLocations = useMemo(() => {
    if (!locations) return [];
    const normalized = query.trim().toLocaleLowerCase("tr");
    if (!normalized) return locations;
    return locations.filter((item) => {
      if (item.name.toLocaleLowerCase("tr").includes(normalized)) return true;
      return item.contacts.some((contact) => contact.full_name.toLocaleLowerCase("tr").includes(normalized));
    });
  }, [locations, query]);

  async function handleToggle(id: string, value: boolean) {
    try {
      await updateLocation(id, { is_active: value });
      refetch();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    }
  }

  function handleDelete(id: string, name: string) {
    showAlert("Konumu Sil", `"${name}" konumunu silmek istediğinize emin misiniz?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteLocation(id);
            refetch();
          } catch (err) {
            showAlert("Hata", toFriendlyErrorMessage(err));
          }
        },
      },
    ]);
  }

  function openAddModal() {
    setNewLocationName("");
    setAddModalVisible(true);
  }

  async function handleAddLocation() {
    const trimmed = newLocationName.trim();
    if (!trimmed || savingNewLocation) return;
    setSavingNewLocation(true);
    try {
      const nextSortOrder = (locations?.length ?? 0) + 1;
      await createLocation({ name: trimmed, sort_order: nextSortOrder });
      setAddModalVisible(false);
      setNewLocationName("");
      refetch();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setSavingNewLocation(false);
    }
  }

  return (
    <ScreenContainer>
      <AdminScreenHeader title="Konumlar" onAdd={openAddModal} />

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <>
          <View style={styles.searchWrap}>
            <MaterialIcons name="search" size={20} color={colors.onSurfaceVariant} />
            <TextInput
              style={styles.searchInput}
              value={query}
              onChangeText={setQuery}
              placeholder="Konum veya kişi ara..."
              placeholderTextColor={colors.outline}
            />
            {query.length > 0 ? (
              <Pressable onPress={() => setQuery("")} hitSlop={8}>
                <MaterialIcons name="close" size={18} color={colors.onSurfaceVariant} />
              </Pressable>
            ) : null}
          </View>

          {locations && locations.length > 0 ? (
            <Text style={styles.countLabel}>
              {filteredLocations.length} / {locations.length} konum
            </Text>
          ) : null}

          <FlatList
            data={filteredLocations}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.listContent}
            onRefresh={refetch}
            refreshing={false}
            ListEmptyComponent={
              <EmptyState
                icon="location-on"
                title={query ? "Sonuç bulunamadı" : "Henüz konum eklenmemiş"}
                description={query ? "Farklı bir arama deneyin." : "Sağ üstteki + ile yeni konum ekleyin."}
              />
            }
            ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
            renderItem={({ item }) => (
              <LocationCard
                location={item}
                onToggleActive={(value) => handleToggle(item.id, value)}
                onEdit={() => router.push(`/(admin)/konumlar/form?id=${item.id}`)}
                onDelete={() => handleDelete(item.id, item.name)}
              />
            )}
          />
        </>
      )}

      <Modal
        visible={addModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAddModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Yeni Konum</Text>
            <TextInput
              style={styles.modalInput}
              value={newLocationName}
              onChangeText={setNewLocationName}
              placeholder="Örn. Toplantı Odası 3"
              placeholderTextColor={colors.outline}
              autoFocus
              onSubmitEditing={handleAddLocation}
              returnKeyType="done"
            />
            <View style={styles.modalButtonRow}>
              <Pressable
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setAddModalVisible(false)}
                disabled={savingNewLocation}
              >
                <Text style={styles.modalButtonTextCancel}>Vazgeç</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, !newLocationName.trim() && styles.modalButtonDisabled]}
                onPress={handleAddLocation}
                disabled={!newLocationName.trim() || savingNewLocation}
              >
                {savingNewLocation ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>Ekle</Text>
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
  searchWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    height: 46,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    backgroundColor: colors.surfaceContainerLowest,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  countLabel: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
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
  modalInput: {
    height: 52,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
    ...typography.bodyLg,
    color: colors.onSurface,
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
