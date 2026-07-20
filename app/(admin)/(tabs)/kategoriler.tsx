import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";

import { AdminListRow } from "@/components/admin/AdminListRow";
import { AdminScreenHeader } from "@/components/admin/AdminScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchAllCategories, updateCategory } from "@/lib/api/catalog";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { spacing } from "@/constants/theme";

export default function AdminCategoriesScreen() {
  const { data: categories, loading, error, refetch } = useAsyncData(fetchAllCategories, []);

  async function handleToggle(id: string, value: boolean) {
    try {
      await updateCategory(id, { is_active: value });
      refetch();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    }
  }

  return (
    <ScreenContainer>
      <AdminScreenHeader title="Kategoriler" onAdd={() => router.push("/(admin)/kategoriler/form")} />

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
              onEdit={() => router.push(`/(admin)/kategoriler/form?id=${item.id}`)}
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
