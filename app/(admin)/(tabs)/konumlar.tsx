import { router } from "expo-router";
import { Alert, FlatList, StyleSheet, View } from "react-native";

import { AdminListRow } from "@/components/admin/AdminListRow";
import { AdminScreenHeader } from "@/components/admin/AdminScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchAllLocations, updateLocation } from "@/lib/api/catalog";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { spacing } from "@/constants/theme";

export default function AdminLocationsScreen() {
  const { data: locations, loading, error, refetch } = useAsyncData(fetchAllLocations, []);

  async function handleToggle(id: string, value: boolean) {
    try {
      await updateLocation(id, { is_active: value });
      refetch();
    } catch (err) {
      Alert.alert("Hata", toFriendlyErrorMessage(err));
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
        <FlatList
          data={locations ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={<EmptyState icon="location-on" title="Henüz konum eklenmemiş" />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.name}
              subtitle={`Sıra: ${item.sort_order}`}
              isActive={item.is_active}
              onToggleActive={(value) => handleToggle(item.id, value)}
              onEdit={() => router.push(`/(admin)/konumlar/form?id=${item.id}`)}
            />
          )}
        />
      )}
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
});
