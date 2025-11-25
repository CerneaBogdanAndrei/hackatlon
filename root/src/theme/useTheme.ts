import { useColorScheme } from "react-native";
import { darkTheme, lightTheme } from "./themes";

export function useTheme() {
    const scheme = useColorScheme();
    return scheme === "dark" ? darkTheme : lightTheme;
}
