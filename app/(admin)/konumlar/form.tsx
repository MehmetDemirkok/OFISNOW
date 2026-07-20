import { useEffect, useState } from "react";
import { MaterialIcons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from "react-native";

import { Button } from "@/components/ui/Button";
import { LoadingView } from "@/components/ui/LoadingView";
import { ScreenContainer } from "@/components/ui/ScreenContainer";
import { useAsyncData } from "@/hooks/useAsyncData";
import {
  addLocationContact,
  createLocation,
  deleteLocationContact,
  fetchLocationById,
  fetchLocationContacts,
  updateLocation,
} from "@/lib/api/catalog";
import { showAlert } from "@/lib/alert";
import { toFriendlyErrorMessage } from "@/lib/supabase";
import { colors, radius, spacing, typography } from "@/constants/theme";

export default function LocationFormScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const isEdit = !!id;

  const { data: existing, loading } = useAsyncData(
    () => (isEdit ? fetchLocationById(id) : Promise.resolve(null)),
    [id]
  );

  const {
    data: contacts,
    loading: contactsLoading,
    refetch: refetchContacts,
  } = useAsyncData(() => (isEdit ? fetchLocationContacts(id) : Promise.resolve([])), [id]);

  const [name, setName] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isActive, setIsActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const [contactName, setContactName] = useState("");
  const [addingContact, setAddingContact] = useState(false);
  const [deletingContactId, setDeletingContactId] = useState<string | null>(null);

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setSortOrder(String(existing.sort_order));
      setIsActive(existing.is_active);
    }
  }, [existing]);

  const canSave = name.trim().length > 0 && !saving;
  const canAddContact = contactName.trim().length > 0 && !addingContact;

  async function handleSave() {
    if (!canSave) return;
    setSaving(true);
    try {
      const parsedSort = Number(sortOrder) || 0;
      if (isEdit) {
        await updateLocation(id, { name: name.trim(), sort_order: parsedSort, is_active: isActive });
        router.back();
      } else {
        const created = await createLocation({ name: name.trim(), sort_order: parsedSort });
        // Kişi eklenebilmesi için oluşturulan konumun düzenleme moduna geç.
        router.replace(`/(admin)/konumlar/form?id=${created.id}`);
      }
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  async function handleAddContact() {
    if (!canAddContact || !isEdit) return;
    setAddingContact(true);
    try {
      await addLocationContact(id, contactName.trim());
      setContactName("");
      refetchContacts();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setAddingContact(false);
    }
  }

  async function handleRemoveContact(contactId: string) {
    setDeletingContactId(contactId);
    try {
      await deleteLocationContact(contactId);
      refetchContacts();
    } catch (err) {
      showAlert("Hata", toFriendlyErrorMessage(err));
    } finally {
      setDeletingContactId(null);
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
        <Text style={styles.title}>{isEdit ? "Konumu Düzenle" : "Yeni Konum"}</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.field}>
          <Text style={styles.label}>Konum Adı</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder="Toplantı Odası 1" />
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

        {isEdit ? (
          <View style={styles.contactsSection}>
            <Text style={styles.sectionTitle}>Kişiler</Text>
            <Text style={styles.sectionSubtitle}>Bu konumda bulunan kişileri ekleyin.</Text>

            <View style={styles.addContactRow}>
              <TextInput
                style={[styles.input, styles.addContactInput]}
                value={contactName}
                onChangeText={setContactName}
                placeholder="Kişi adı (örn. Ahmet Yılmaz)"
                onSubmitEditing={handleAddContact}
                returnKeyType="done"
              />
              <Pressable
                onPress={handleAddContact}
                disabled={!canAddContact}
                style={[styles.addContactButton, !canAddContact && styles.addContactButtonDisabled]}
              >
                {addingContact ? (
                  <ActivityIndicator color="#ffffff" size="small" />
                ) : (
                  <MaterialIcons name="add" size={22} color="#ffffff" />
                )}
              </Pressable>
            </View>

            {contactsLoading ? (
              <ActivityIndicator style={{ marginTop: spacing.md }} color={colors.primary} />
            ) : contacts && contacts.length > 0 ? (
              <View style={styles.contactList}>
                {contacts.map((contact) => (
                  <View key={contact.id} style={styles.contactRow}>
                    <View style={styles.contactAvatar}>
                      <MaterialIcons name="person" size={16} color={colors.primary} />
                    </View>
                    <Text style={styles.contactName} numberOfLines={1}>
                      {contact.full_name}
                    </Text>
                    <Pressable
                      onPress={() => handleRemoveContact(contact.id)}
                      hitSlop={10}
                      disabled={deletingContactId === contact.id}
                    >
                      {deletingContactId === contact.id ? (
                        <ActivityIndicator size="small" color={colors.error} />
                      ) : (
                        <MaterialIcons name="close" size={18} color={colors.onSurfaceVariant} />
                      )}
                    </Pressable>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyContactsText}>Henüz kişi eklenmemiş.</Text>
            )}
          </View>
        ) : null}
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
  contactsSection: {
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.outlineVariant,
    gap: spacing.sm,
  },
  sectionTitle: {
    ...typography.headlineSm,
    color: colors.onSurface,
  },
  sectionSubtitle: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    marginTop: -spacing.xs,
  },
  addContactRow: {
    flexDirection: "row",
    gap: spacing.sm,
    alignItems: "center",
  },
  addContactInput: {
    flex: 1,
  },
  addContactButton: {
    width: 52,
    height: 52,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  addContactButtonDisabled: {
    opacity: 0.5,
  },
  contactList: {
    gap: spacing.sm,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    backgroundColor: colors.surfaceContainerLowest,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.outlineVariant,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  contactAvatar: {
    width: 28,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: colors.primaryFixed,
    alignItems: "center",
    justifyContent: "center",
  },
  contactName: {
    flex: 1,
    ...typography.bodyMd,
    color: colors.onSurface,
  },
  emptyContactsText: {
    ...typography.bodyMd,
    color: colors.outline,
    paddingVertical: spacing.sm,
  },
});
