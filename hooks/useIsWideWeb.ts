import { Platform, useWindowDimensions } from "react-native";

import { webShell } from "@/constants/theme";

/** Geniş masaüstü tarayıcı mı? Native'de ve dar/mobil webde her zaman false. */
export function useIsWideWeb() {
  const { width } = useWindowDimensions();
  return Platform.OS === "web" && width >= webShell.breakpoint;
}
