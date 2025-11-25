import { View, Text, Pressable, StyleSheet, Image } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/useTheme";

type Props = {
    location: {
        id: number;
        name: string;
        address: string;
        image_url?: string | null;
        short_description?: string | null;
        rating?: number | null;
    };
    liked?: boolean;
    onPress?: () => void;
    onToggleLike?: () => void;
};

export default function LocationCard({
                                         location,
                                         liked = false,
                                         onPress,
                                         onToggleLike,
                                     }: Props) {
    const theme = useTheme();

    return (
        <Pressable
            onPress={onPress}
            style={[
                styles.card,
                { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
            ]}
        >
            {!!location.image_url && (
                <Image source={{ uri: location.image_url }} style={styles.cardImg} />
            )}

            <View style={{ flex: 1 }}>
                <View style={styles.rowTop}>
                    <Text
                        style={[styles.cardTitle, { color: theme.colors.text }]}
                        numberOfLines={1}
                    >
                        {location.name}
                    </Text>

                    {/* ❤️ BUTON FAVORITE */}
                    <Pressable onPress={onToggleLike} hitSlop={10}>
                        <Ionicons
                            name={liked ? "heart" : "heart-outline"}
                            size={22}
                            color={liked ? theme.colors.accent : theme.colors.text}
                        />
                    </Pressable>
                </View>

                <Text style={[styles.cardAddr, { color: theme.colors.subtext }]}>
                    {location.address}
                </Text>

                {!!location.short_description && (
                    <Text
                        style={[styles.cardDesc, { color: theme.colors.text }]}
                        numberOfLines={2}
                    >
                        {location.short_description}
                    </Text>
                )}

                {location.rating != null && (
                    <Text style={[styles.cardRating, { color: theme.colors.text }]}>
                        ⭐ {location.rating}
                    </Text>
                )}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        flexDirection: "row",
        gap: 10,
        borderRadius: 14,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
    },
    cardImg: {
        width: 90,
        height: 90,
        borderRadius: 10,
        backgroundColor: "#222",
    },
    rowTop: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        gap: 8,
    },
    cardTitle: { fontSize: 16, fontWeight: "800", flex: 1 },
    cardAddr: { fontSize: 12, opacity: 0.9, marginTop: 2 },
    cardDesc: { fontSize: 13, marginTop: 6, opacity: 0.9 },
    cardRating: { marginTop: 6, fontWeight: "700" },
});
