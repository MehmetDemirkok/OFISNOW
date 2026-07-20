import { useEffect, useState } from "react";
import { Modal, Pressable, StyleSheet, Text, View } from "react-native";

import { colors, radius, spacing, typography } from "@/constants/theme";
import { registerAlertHandler } from "@/lib/alert";
import type { AlertButton } from "@/lib/alert";

interface AlertState {
  title: string;
  message?: string;
  buttons: AlertButton[];
}

/**
 * Alert.alert'in web'de (react-native-web) no-op olması nedeniyle uygulama
 * genelinde kullanılan cross-platform alert/onay modalı. app/_layout.tsx içinde
 * bir kez render edilir; lib/alert.ts'teki showAlert() ile tetiklenir.
 */
export function AppAlert() {
  const [state, setState] = useState<AlertState | null>(null);

  useEffect(() => {
    registerAlertHandler((title, message, buttons) => {
      setState({
        title,
        message,
        buttons: buttons && buttons.length > 0 ? buttons : [{ text: "Tamam" }],
      });
    });
    return () => registerAlertHandler(null);
  }, []);

  if (!state) return null;

  function handlePress(button: AlertButton) {
    setState(null);
    button.onPress?.();
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={() => setState(null)}>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <Text style={styles.title}>{state.title}</Text>
          {state.message ? <Text style={styles.message}>{state.message}</Text> : null}

          <View style={styles.buttonRow}>
            {state.buttons.map((button, index) => (
              <Pressable
                key={`${button.text}-${index}`}
                style={({ pressed }) => [
                  styles.button,
                  button.style === "cancel" && styles.buttonCancel,
                  button.style === "destructive" && styles.buttonDestructive,
                  pressed && styles.buttonPressed,
                ]}
                onPress={() => handlePress(button)}
              >
                <Text
                  style={[
                    styles.buttonText,
                    button.style === "cancel" && styles.buttonTextCancel,
                    button.style === "destructive" && styles.buttonTextDestructive,
                  ]}
                >
                  {button.text}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    alignItems: "center",
    justifyContent: "center",
    padding: spacing.lg,
  },
  card: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    gap: spacing.xs,
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  title: {
    ...typography.headlineSm,
    color: colors.onSurface,
    textAlign: "center",
  },
  message: {
    ...typography.bodyMd,
    color: colors.onSurfaceVariant,
    textAlign: "center",
    marginBottom: spacing.sm,
  },
  buttonRow: {
    flexDirection: "row",
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  button: {
    flex: 1,
    height: 46,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primary,
  },
  buttonPressed: {
    opacity: 0.85,
  },
  buttonCancel: {
    backgroundColor: colors.surfaceContainerHigh,
  },
  buttonDestructive: {
    backgroundColor: colors.errorContainer,
  },
  buttonText: {
    ...typography.bodyMd,
    fontWeight: "700",
    color: "#ffffff",
  },
  buttonTextCancel: {
    color: colors.onSurfaceVariant,
  },
  buttonTextDestructive: {
    color: colors.error,
  },
});
