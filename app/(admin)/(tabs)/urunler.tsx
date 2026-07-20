import { router } from "expo-router";
import { FlatList, StyleSheet, View } from "react-native";

import { AdminListRow } from "@/components/admin/AdminListRow";
import { AdminScreenHeader } from "@/components/admin/AdminScreenHeader";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { fetchAllCategories, fetchAllProducts, updateProduct } from "@/lib/api/catalog";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { spacing } from "@/constants/theme";

export default function AdminProductsScreen() {
  const { data: products, loading, error, refetch } = useAsyncData(fetchAllProducts, []);
  const { data: categories } = useAsyncData(fetchAllCategories, []);

  const categoryName = (categoryId: string) =>
    categories?.find((c) => c.id === categoryId)?.name ?? "";

  async function handleToggle(id: string, value: boolean) {
    try {
      await updateProduct(id, { is_active: value });
      refetch();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    }
  }

  return (
    <ScreenContainer>
      <AdminScreenHeader title="Ürünler" onAdd={() => router.push("/(admin)/urunler/form")} />

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : (
        <FlatList
          data={products ?? []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetch}
          refreshing={false}
          ListEmptyComponent={<EmptyState icon="restaurant" title="Henüz ürün eklenmemiş" />}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          renderItem={({ item }) => (
            <AdminListRow
              title={item.name}
              subtitle={categoryName(item.category_id)}
              isActive={item.is_active}
              onToggleActive={(value) => handleToggle(item.id, value)}
              onEdit={() => router.push(`/(admin)/urunler/form?id=${item.id}`)}
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
