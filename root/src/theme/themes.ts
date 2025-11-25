export type AppTheme = {
    mode: "light" | "dark";
    colors: {
        bg: string;
        card: string;
        text: string;
        subtext: string;
        border: string;
        primary: string;
        accent: string;
        danger: string;
    };
};

export const lightTheme: AppTheme = {
    mode: "light",
    colors: {
        bg: "#f3f4f6",
        card: "#ffffff",
        text: "#020617",
        subtext: "#6b7280",
        border: "#e5e7eb",
        primary: "#2563eb",
        accent: "#ef4444",
        danger: "#b91c1c",
    },
};

export const darkTheme: AppTheme = {
    mode: "dark",
    colors: {
        bg: "#020617",
        card: "#020617",
        text: "#f9fafb",
        subtext: "#9ca3af",
        border: "#1f2937",
        primary: "#3b82f6",
        accent: "#fb7185",
        danger: "#f87171",
    },
};
