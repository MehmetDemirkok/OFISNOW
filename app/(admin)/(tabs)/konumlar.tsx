import { useMemo, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router } from "expo-router";
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { AdminScreenHeader } from "@/components/admin/AdminScreenHeader";
import { LocationCard } from "@/components/admin/LocationCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchAllLocations, updateLocation } from "@/lib/api/catalog";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function AdminLocationsScreen() {
  const { data: locations, loading, error, refetch } = useAsyncData(fetchAllLocations, []);
  const [query, setQuery] = useState("");

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

  return (
    <ScreenContainer>
      <AdminScreenHeader title="Konumlar" onAdd={() => router.push("/(admin)/konumlar/form")} />

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
              />
            )}
          />
        </>
      )}
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
});
