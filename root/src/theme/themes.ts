export const lightTheme = {
    mode: "light" as const,
    colors: {
        bg: "#ffffff",
        text: "#0b0b0b",
        subtext: "#666",
        card: "#ffffff",
        border: "#e9e9e9",
        primary: "#111111",
        accent: "#e11d48",
        mapOverlay: "rgba(255,255,255,0.9)",
    },
};

export const darkTheme = {
    mode: "dark" as const,
    colors: {
        bg: "#0b0b0b",
        text: "#ffffff",
        subtext: "#a1a1aa",
        card: "#141414",
        border: "#222",
        primary: "#ffffff",
        accent: "#fb7185",
        mapOverlay: "rgba(10,10,10,0.9)",
    },
};

export type AppTheme = typeof lightTheme;
