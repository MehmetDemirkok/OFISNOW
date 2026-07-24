import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "ofisnow_last_account";

export interface LastAccount {
  email: string;
  fullName: string;
  avatarUrl: string | null;
}

/**
 * Giriş ekranındaki "Hızlı Giriş" kartı için son giriş yapılan hesabı
 * hatırlar (yalnızca e-posta/ad/avatar — şifre asla saklanmaz). Depolama
 * kullanılamıyorsa veya temizlenmişse (ör. tarayıcı verileri silindiğinde)
 * fonksiyonlar sessizce null/no-op döner; giriş ekranı normal haliyle
 * çalışmaya devam eder.
 */
export async function saveLastAccount(account: LastAccount): Promise<void> {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(account));
  } catch {
    // Depolama yazılamıyorsa hızlı giriş kartı basitçe görünmez.
  }
}

export async function getLastAccount(): Promise<LastAccount | null> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed?.email !== "string") return null;
    return parsed as LastAccount;
  } catch {
    return null;
  }
}

export async function clearLastAccount(): Promise<void> {
  try {
    await AsyncStorage.removeItem(STORAGE_KEY);
  } catch {
    // yok say
  }
}
