import { useMemo, useState } from "react";
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import { useIsWideWeb } from "@/hooks/useIsWideWeb";
import { useAuth } from "@/context/AuthContext";
import {
  createCategory,
  createProduct,
  deleteCategory,
  deleteProduct,
  fetchAllCategories,
  fetchAllProducts,
  updateCategory,
  updateProduct,
  uploadProductImage,
} from "@/lib/api/catalog";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { productVisual } from "@/constants/productIcons";
import { drinkImage } from "@/constants/drinkImages";
import { colors, radius, shadows, spacing, typography } from "@/constants/theme";
import type { Category, Product } from "@/types/database";

interface CategoryModalState {
  visible: boolean;
  editing: Category | null;
  name: string;
  sortOrder: string;
  isActive: boolean;
}

const CATEGORY_MODAL_DEFAULT: CategoryModalState = {
  visible: false,
  editing: null,
  name: "",
  sortOrder: "0",
  isActive: true,
};

interface ProductModalState {
  visible: boolean;
  editing: Product | null;
  name: string;
  description: string;
  categoryId: string | null;
  isActive: boolean;
  imageUri: string | null;
  imageChanged: boolean;
}

const PRODUCT_MODAL_DEFAULT: ProductModalState = {
  visible: false,
  editing: null,
  name: "",
  description: "",
  categoryId: null,
  isActive: true,
  imageUri: null,
  imageChanged: false,
};

export default function CatalogScreen() {
  const { profile } = useAuth();
  const isWideWeb = useIsWideWeb();
  const {
    data: categories,
    loading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
  } = useAsyncData(fetchAllCategories, []);
  const {
    data: products,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
  } = useAsyncData(fetchAllProducts, []);

  const [search, setSearch] = useState("");
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});
  const [categoryModal, setCategoryModal] = useState<CategoryModalState>(CATEGORY_MODAL_DEFAULT);
  const [productModal, setProductModal] = useState<ProductModalState>(PRODUCT_MODAL_DEFAULT);
  const [saving, setSaving] = useState(false);
  const [pickingImage, setPickingImage] = useState(false);

  const loading = categoriesLoading || productsLoading;
  const error = categoriesError || productsError;

  function refetchAll() {
    refetchCategories();
    refetchProducts();
  }

  const query = search.trim().toLowerCase();

  const sections = useMemo(() => {
    const allCategories = categories ?? [];
    const allProducts = products ?? [];

    return allCategories.map((category) => {
      const categoryProducts = allProducts.filter((p) => p.category_id === category.id);
      const nameMatches = category.name.toLowerCase().includes(query);
      const matchingProducts = query
        ? categoryProducts.filter(
            (p) =>
              p.name.toLowerCase().includes(query) ||
              (p.description ?? "").toLowerCase().includes(query)
          )
        : categoryProducts;

      return {
        category,
        products: query && !nameMatches ? matchingProducts : categoryProducts,
        visible: !query || nameMatches || matchingProducts.length > 0,
      };
    });
  }, [categories, products, query]);

  const visibleSections = sections.filter((s) => s.visible);

  function toggleCollapsed(categoryId: string) {
    setCollapsedIds((prev) => ({ ...prev, [categoryId]: !prev[categoryId] }));
  }

  // ---- Kategori aksiyonları ----
  function openAddCategory() {
    setCategoryModal({
      visible: true,
      editing: null,
      name: "",
      sortOrder: String((categories?.length ?? 0) + 1),
      isActive: true,
    });
  }

  function openEditCategory(category: Category) {
    setCategoryModal({
      visible: true,
      editing: category,
      name: category.name,
      sortOrder: String(category.sort_order),
      isActive: category.is_active,
    });
  }

  function closeCategoryModal() {
    setCategoryModal(CATEGORY_MODAL_DEFAULT);
  }

  async function handleSaveCategory() {
    if (!categoryModal.name.trim() || saving) return;
    setSaving(true);
    try {
      const parsedSort = Number(categoryModal.sortOrder) || 0;
      if (categoryModal.editing) {
        await updateCategory(categoryModal.editing.id, {
          name: categoryModal.name.trim(),
          sort_order: parsedSort,
          is_active: categoryModal.isActive,
        });
      } else {
        await createCategory({ name: categoryModal.name.trim(), sort_order: parsedSort });
      }
      closeCategoryModal();
      refetchCategories();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleToggleCategoryActive(category: Category, value: boolean) {
    updateCategory(category.id, { is_active: value })
      .then(refetchCategories)
      .catch((err) => showAlert("Hata", toFriendlyErrorMessage(err)));
  }

  function handleDeleteCategory(category: Category) {
    showAlert("Kategoriyi Sil", `"${category.name}" kategorisini silmek istediğinize emin misiniz?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteCategory(category.id);
            refetchCategories();
          } catch (err) {
            showAlert("Hata", toFriendlyErrorMessage(err));
          }
        },
      },
    ]);
  }

  // ---- Ürün aksiyonları ----
  function openAddProduct(categoryId?: string) {
    setProductModal({
      visible: true,
      editing: null,
      name: "",
      description: "",
      categoryId: categoryId ?? categories?.[0]?.id ?? null,
      isActive: true,
      imageUri: null,
      imageChanged: false,
    });
  }

  function openEditProduct(product: Product) {
    setProductModal({
      visible: true,
      editing: product,
      name: product.name,
      description: product.description ?? "",
      categoryId: product.category_id,
      isActive: product.is_active,
      imageUri: product.image_url ?? null,
      imageChanged: false,
    });
  }

  function closeProductModal() {
    setProductModal(PRODUCT_MODAL_DEFAULT);
  }

  async function handlePickProductImage() {
    setPickingImage(true);
    try {
      // Dinamik import: expo-image-picker'ın native modülü olmayan ortamlarda
      // tüm ekranı çökertmek yerine yalnızca bu aksiyon başarısız olur.
      const ImagePicker = await import("expo-image-picker");

      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permission.granted) {
        showAlert("İzin gerekli", "Ürün görseli seçebilmek için galeri izni vermelisiniz.");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.6,
      });
      if (result.canceled || !result.assets[0]) return;

      setProductModal((prev) => ({ ...prev, imageUri: result.assets[0].uri, imageChanged: true }));
    } catch (err) {
      if (err instanceof Error && err.message.includes("Cannot find native module")) {
        showAlert(
          "Görsel seçilemiyor",
          "Bu özellik için uygulamanın yeniden derlenmesi gerekiyor (npx expo run:ios / run:android)."
        );
        return;
      }
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setPickingImage(false);
    }
  }

  function handleRemoveProductImage() {
    setProductModal((prev) => ({ ...prev, imageUri: null, imageChanged: true }));
  }

  async function handleSaveProduct() {
    if (!productModal.name.trim() || !productModal.categoryId || saving) return;
    if (!profile?.company_id) {
      showAlert("Hata", "Şirket bilginiz bulunamadı. Lütfen tekrar giriş yapmayı deneyin.");
      return;
    }
    setSaving(true);
    try {
      let imageUrl: string | null | undefined;
      if (productModal.imageChanged) {
        imageUrl = productModal.imageUri
          ? await uploadProductImage(profile.company_id, productModal.imageUri)
          : null;
      }

      if (productModal.editing) {
        await updateProduct(productModal.editing.id, {
          name: productModal.name.trim(),
          description: productModal.description.trim() || null,
          category_id: productModal.categoryId,
          is_active: productModal.isActive,
          ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
        });
      } else {
        await createProduct({
          name: productModal.name.trim(),
          description: productModal.description.trim() || null,
          category_id: productModal.categoryId,
          ...(imageUrl !== undefined ? { image_url: imageUrl } : {}),
        });
      }
      closeProductModal();
      refetchProducts();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleToggleProductActive(product: Product, value: boolean) {
    updateProduct(product.id, { is_active: value })
      .then(refetchProducts)
      .catch((err) => showAlert("Hata", toFriendlyErrorMessage(err)));
  }

  function handleDeleteProduct(product: Product) {
    showAlert("Ürünü Sil", `"${product.name}" ürününü silmek istediğinize emin misiniz?`, [
      { text: "Vazgeç", style: "cancel" },
      {
        text: "Sil",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteProduct(product.id);
            refetchProducts();
          } catch (err) {
            showAlert("Hata", toFriendlyErrorMessage(err));
          }
        },
      },
    ]);
  }

  const categoryModalValid = categoryModal.name.trim().length > 0 && !saving;
  const productModalValid = productModal.name.trim().length > 0 && !!productModal.categoryId && !saving;
  const noCategories = !categories || categories.length === 0;

  return (
    <ScreenContainer>
      <View style={[{ flex: 1 }, isWideWeb && styles.wideWrap]}>
      <View style={styles.header}>
        <Text style={styles.title}>Katalog</Text>
      </View>

      <View style={styles.actionsRow}>
        <Pressable style={[styles.actionButton, styles.actionButtonOutline]} onPress={openAddCategory}>
          <MaterialIcons name="create-new-folder" size={18} color={colors.primary} />
          <Text style={styles.actionButtonTextOutline}>Yeni Kategori</Text>
        </Pressable>
        <Pressable
          style={[styles.actionButton, styles.actionButtonPrimary, noCategories && styles.actionButtonDisabled]}
          onPress={() => openAddProduct()}
          disabled={noCategories}
        >
          <MaterialIcons name="add" size={18} color="#ffffff" />
          <Text style={styles.actionButtonText}>Yeni Ürün</Text>
        </Pressable>
      </View>

      <View style={styles.searchWrapper}>
        <MaterialIcons name="search" size={20} color={colors.outline} />
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="Kategori veya ürün ara"
          placeholderTextColor={colors.outline}
        />
        {search.length > 0 ? (
          <Pressable onPress={() => setSearch("")} hitSlop={8}>
            <MaterialIcons name="close" size={18} color={colors.outline} />
          </Pressable>
        ) : null}
      </View>

      {loading ? (
        <LoadingView />
      ) : error ? (
        <ErrorState message={error} onRetry={refetchAll} />
      ) : (
        <FlatList
          data={visibleSections}
          keyExtractor={(item) => item.category.id}
          contentContainerStyle={styles.listContent}
          onRefresh={refetchAll}
          refreshing={false}
          ItemSeparatorComponent={() => <View style={{ height: spacing.sm }} />}
          ListEmptyComponent={
            <EmptyState
              icon="list-alt"
              title={query ? "Sonuç bulunamadı" : "Henüz kategori eklenmemiş"}
              description={query ? undefined : "Başlamak için bir kategori ekleyin."}
            />
          }
          renderItem={({ item }) => {
            const collapsed = !!collapsedIds[item.category.id] && !query;
            return (
              <View style={[styles.categoryCard, !item.category.is_active && styles.categoryCardInactive]}>
                <Pressable style={styles.categoryHeader} onPress={() => toggleCollapsed(item.category.id)}>
                  <MaterialIcons
                    name={collapsed ? "chevron-right" : "expand-more"}
                    size={22}
                    color={colors.onSurfaceVariant}
                  />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.categoryName}>{item.category.name}</Text>
                    <Text style={styles.categoryMeta}>
                      Sıra: {item.category.sort_order} · {item.products.length} ürün
                    </Text>
                  </View>
                  <Switch
                    value={item.category.is_active}
                    onValueChange={(v) => handleToggleCategoryActive(item.category, v)}
                    trackColor={{ false: colors.outlineVariant, true: colors.primary }}
                  />
                  <Pressable onPress={() => openEditCategory(item.category)} hitSlop={10}>
                    <MaterialIcons name="edit" size={20} color={colors.onSurfaceVariant} />
                  </Pressable>
                  <Pressable onPress={() => handleDeleteCategory(item.category)} hitSlop={10}>
                    <MaterialIcons name="delete-outline" size={20} color={colors.error} />
                  </Pressable>
                </Pressable>

                {!collapsed ? (
                  <View style={styles.productList}>
                    {item.products.length === 0 ? (
                      <Text style={styles.emptyProductsText}>Bu kategoride henüz ürün yok.</Text>
                    ) : (
                      item.products.map((product) => {
                        const visual = productVisual(product.name, item.category.name);
                        const preset = drinkImage(product.name);
                        return (
                          <View
                            key={product.id}
                            style={[styles.productRow, !product.is_active && styles.productRowInactive]}
                          >
                            {product.image_url ? (
                              <Image source={{ uri: product.image_url }} style={styles.productThumb} />
                            ) : preset ? (
                              <View style={[styles.productThumb, styles.productThumbPlaceholder, { backgroundColor: visual.bg }]}>
                                <Image source={preset} style={styles.productThumbPreset} />
                              </View>
                            ) : (
                              <View style={[styles.productThumb, styles.productThumbPlaceholder, { backgroundColor: visual.bg }]}>
                                <MaterialCommunityIcons name={visual.icon} size={22} color={visual.fg} />
                              </View>
                            )}
                            <View style={{ flex: 1 }}>
                              <Text style={styles.productName}>{product.name}</Text>
                              {product.description ? (
                                <Text style={styles.productDescription} numberOfLines={1}>
                                  {product.description}
                                </Text>
                              ) : null}
                            </View>
                            <Switch
                              value={product.is_active}
                              onValueChange={(v) => handleToggleProductActive(product, v)}
                              trackColor={{ false: colors.outlineVariant, true: colors.primary }}
                            />
                            <Pressable onPress={() => openEditProduct(product)} hitSlop={10}>
                              <MaterialIcons name="edit" size={18} color={colors.onSurfaceVariant} />
                            </Pressable>
                            <Pressable onPress={() => handleDeleteProduct(product)} hitSlop={10}>
                              <MaterialIcons name="delete-outline" size={18} color={colors.error} />
                            </Pressable>
                          </View>
                        );
                      })
                    )}

                    <Pressable style={styles.addProductButton} onPress={() => openAddProduct(item.category.id)}>
                      <MaterialIcons name="add" size={16} color={colors.primary} />
                      <Text style={styles.addProductButtonText}>Bu kategoriye ürün ekle</Text>
                    </Pressable>
                  </View>
                ) : null}
              </View>
            );
          }}
        />
      )}
      </View>

      <Modal visible={categoryModal.visible} transparent animationType="fade" onRequestClose={closeCategoryModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {categoryModal.editing ? "Kategoriyi Düzenle" : "Yeni Kategori"}
            </Text>

            <View style={styles.field}>
              <Text style={styles.label}>Kategori Adı</Text>
              <TextInput
                style={styles.input}
                value={categoryModal.name}
                onChangeText={(v) => setCategoryModal((prev) => ({ ...prev, name: v }))}
                placeholder="Sıcak İçecekler"
                placeholderTextColor={colors.outline}
                autoFocus
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Sıra</Text>
              <TextInput
                style={styles.input}
                value={categoryModal.sortOrder}
                onChangeText={(v) => setCategoryModal((prev) => ({ ...prev, sortOrder: v }))}
                keyboardType="number-pad"
              />
            </View>

            <View style={styles.switchRow}>
              <Text style={styles.label}>Aktif</Text>
              <Switch
                value={categoryModal.isActive}
                onValueChange={(v) => setCategoryModal((prev) => ({ ...prev, isActive: v }))}
                trackColor={{ false: colors.outlineVariant, true: colors.primary }}
              />
            </View>

            <View style={styles.modalButtonRow}>
              <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={closeCategoryModal} disabled={saving}>
                <Text style={styles.modalButtonTextCancel}>Vazgeç</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, !categoryModalValid && styles.modalButtonDisabled]}
                onPress={handleSaveCategory}
                disabled={!categoryModalValid}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>
                    {categoryModal.editing ? "Kaydet" : "Ekle"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={productModal.visible} transparent animationType="fade" onRequestClose={closeProductModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{productModal.editing ? "Ürünü Düzenle" : "Yeni Ürün"}</Text>

            <ScrollView contentContainerStyle={styles.modalScrollContent} keyboardShouldPersistTaps="handled">
              <View style={[styles.field, { alignItems: "center" }]}>
                <Pressable
                  style={styles.imagePickerWrap}
                  onPress={handlePickProductImage}
                  disabled={pickingImage}
                >
                  {productModal.imageUri ? (
                    <Image source={{ uri: productModal.imageUri }} style={styles.imagePickerPreview} />
                  ) : (
                    (() => {
                      const preset = drinkImage(productModal.name);
                      if (preset) {
                        return <Image source={preset} style={styles.imagePickerPreview} />;
                      }
                      const preview = productVisual(
                        productModal.name,
                        categories?.find((c) => c.id === productModal.categoryId)?.name
                      );
                      return (
                        <View style={[styles.imagePickerPlaceholder, { backgroundColor: preview.bg }]}>
                          <MaterialCommunityIcons name={preview.icon} size={32} color={preview.fg} />
                        </View>
                      );
                    })()
                  )}
                  <View style={styles.imagePickerBadge}>
                    {pickingImage ? (
                      <ActivityIndicator size="small" color="#ffffff" />
                    ) : (
                      <MaterialIcons name="photo-camera" size={14} color="#ffffff" />
                    )}
                  </View>
                </Pressable>
                {productModal.imageUri ? (
                  <Pressable onPress={handleRemoveProductImage} hitSlop={8}>
                    <Text style={styles.removeImageText}>Görseli kaldır</Text>
                  </Pressable>
                ) : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Ürün Adı</Text>
                <TextInput
                  style={styles.input}
                  value={productModal.name}
                  onChangeText={(v) => setProductModal((prev) => ({ ...prev, name: v }))}
                  placeholder="Türk Kahvesi"
                  placeholderTextColor={colors.outline}
                  autoFocus
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Açıklama</Text>
                <TextInput
                  style={[styles.input, styles.multiline]}
                  value={productModal.description}
                  onChangeText={(v) => setProductModal((prev) => ({ ...prev, description: v }))}
                  placeholder="Kısa açıklama (opsiyonel)"
                  placeholderTextColor={colors.outline}
                  multiline
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Kategori</Text>
                <View style={styles.chipRow}>
                  {(categories ?? []).map((c) => (
                    <Pressable
                      key={c.id}
                      onPress={() => setProductModal((prev) => ({ ...prev, categoryId: c.id }))}
                      style={[styles.chip, productModal.categoryId === c.id && styles.chipSelected]}
                    >
                      <Text
                        style={[styles.chipText, productModal.categoryId === c.id && styles.chipTextSelected]}
                      >
                        {c.name}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>

              <View style={styles.switchRow}>
                <Text style={styles.label}>Aktif</Text>
                <Switch
                  value={productModal.isActive}
                  onValueChange={(v) => setProductModal((prev) => ({ ...prev, isActive: v }))}
                  trackColor={{ false: colors.outlineVariant, true: colors.primary }}
                />
              </View>
            </ScrollView>

            <View style={styles.modalButtonRow}>
              <Pressable style={[styles.modalButton, styles.modalButtonCancel]} onPress={closeProductModal} disabled={saving}>
                <Text style={styles.modalButtonTextCancel}>Vazgeç</Text>
              </Pressable>
              <Pressable
                style={[styles.modalButton, styles.modalButtonPrimary, !productModalValid && styles.modalButtonDisabled]}
                onPress={handleSaveProduct}
                disabled={!productModalValid}
              >
                {saving ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <Text style={styles.modalButtonTextPrimary}>
                    {productModal.editing ? "Kaydet" : "Ekle"}
                  </Text>
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
  wideWrap: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
    paddingRight: 64,
    gap: 2,
  },
  title: {
    ...typography.headlineLg,
    color: colors.onSurface,
  },
  subtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
  },
  actionsRow: {
    flexDirection: "row",
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    marginTop: spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.xs,
    height: 44,
    borderRadius: radius.md,
  },
  actionButtonOutline: {
    backgroundColor: colors.surfaceContainerLowest,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  actionButtonPrimary: {
    backgroundColor: colors.primary,
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  actionButtonText: {
    ...typography.labelLg,
    textTransform: "none",
    letterSpacing: 0,
    color: "#ffffff",
    fontWeight: "700",
  },
  actionButtonTextOutline: {
    ...typography.labelLg,
    textTransform: "none",
    letterSpacing: 0,
    color: colors.primary,
    fontWeight: "700",
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    marginHorizontal: spacing.md,
    marginTop: spacing.sm,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.surfaceContainerLowest,
  },
  searchInput: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: 140,
    flexGrow: 1,
  },
  categoryCard: {
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    overflow: "hidden",
  },
  categoryCardInactive: {
    opacity: 0.6,
  },
  categoryHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.md,
  },
  categoryName: {
    ...typography.bodyLg,
    fontWeight: "700",
    color: colors.onSurface,
  },
  categoryMeta: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
    marginTop: 2,
  },
  productList: {
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    padding: spacing.md,
    gap: spacing.sm,
  },
  emptyProductsText: {
    ...typography.bodyMd,
    color: colors.outline,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    padding: spacing.xs,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
    ...shadows.sm,
  },
  productRowInactive: {
    opacity: 0.5,
  },
  productThumb: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    resizeMode: "cover",
  },
  productThumbPlaceholder: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
  },
  productThumbPreset: {
    width: "72%",
    height: "72%",
    resizeMode: "contain",
  },
  productName: {
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  productDescription: {
    ...typography.labelMd,
    color: colors.onSurfaceVariant,
  },
  addProductButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs,
    alignSelf: "flex-start",
    paddingVertical: spacing.xs,
  },
  addProductButtonText: {
    ...typography.labelLg,
    textTransform: "none",
    letterSpacing: 0,
    color: colors.primary,
    fontWeight: "700",
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
    maxWidth: 380,
    maxHeight: "80%",
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
  modalScrollContent: {
    gap: spacing.md,
  },
  field: {
    gap: spacing.xs,
  },
  imagePickerWrap: {
    width: 88,
    height: 88,
  },
  imagePickerPreview: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    resizeMode: "cover",
  },
  imagePickerPlaceholder: {
    width: 88,
    height: 88,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceContainerHigh,
    alignItems: "center",
    justifyContent: "center",
  },
  imagePickerBadge: {
    position: "absolute",
    right: -2,
    bottom: -2,
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: colors.surface,
  },
  removeImageText: {
    ...typography.labelMd,
    color: colors.error,
    marginTop: spacing.xs,
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
