export interface AlertButton {
  text: string;
  style?: "default" | "cancel" | "destructive";
  onPress?: () => void;
}

type AlertHandler = (title: string, message?: string, buttons?: AlertButton[]) => void;

let handler: AlertHandler | null = null;

/** AppAlert bileşeni mount olduğunda kendini burada kaydeder. */
export function registerAlertHandler(fn: AlertHandler | null) {
  handler = fn;
}

/**
 * react-native'in Alert.alert'ine drop-in yerine geçer.
 * react-native-web'de Alert.alert no-op olduğu için (web'de hiçbir şey göstermez),
 * bunun yerine AppAlert bileşeninin render ettiği özel modal kullanılır.
 */
export function showAlert(title: string, message?: string, buttons?: AlertButton[]) {
  if (!handler) {
    console.warn("[OfisNow] AppAlert henüz hazır değil:", title, message);
    return;
  }
  handler(title, message, buttons);
}
