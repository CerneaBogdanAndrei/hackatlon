import { useColorScheme } from "react-native";
import { darkTheme, lightTheme, type AppTheme } from "./themes";

export function useTheme(): AppTheme {
    const scheme = useColorScheme();
    return scheme === "dark" ? darkTheme : lightTheme;
}
