import { View, Text, Image, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Animated from "react-native-reanimated";
import { useTheme } from "../theme/useTheme";
import type { Location } from "../services/locationsRepo";

type Props = {
    location: Location;
    liked: boolean;
    onPress: () => void;
    onToggleLike: () => void;
};

export default function LocationCard({
                                         location,
                                         liked,
                                         onPress,
                                         onToggleLike,
                                     }: Props) {
    const theme = useTheme();

    return (
        <Pressable onPress={onPress} style={{ marginBottom: 12 }}>
            <View
                style={[
                    styles.card,
                    { backgroundColor: theme.colors.card, borderColor: theme.colors.border },
                ]}
            >
                <Animated.Image
                    sharedTransitionTag={`loc-img-${location.id}`}
                    source={{ uri: location.image_url }}
                    style={styles.img}
                />

                <View style={styles.content}>
                    <View style={styles.rowTitle}>
                        <View style={{ flex: 1 }}>
                            <Animated.Text
                                sharedTransitionTag={`loc-title-${location.id}`}
                                style={[styles.title, { color: theme.colors.text }]}
                                numberOfLines={1}
                            >
                                {location.name}
                            </Animated.Text>
                            <Text
                                style={[styles.address, { color: theme.colors.subtext }]}
                                numberOfLines={1}
                            >
                                {location.address}
                            </Text>
                        </View>

                        <Pressable onPress={onToggleLike} hitSlop={10}>
                            <Ionicons
                                name={liked ? "heart" : "heart-outline"}
                                size={22}
                                color={liked ? theme.colors.accent : theme.colors.text}
                            />
                        </Pressable>
                    </View>

                    <View style={styles.rowBottom}>
                        <Text
                            style={[styles.desc, { color: theme.colors.subtext }]}
                            numberOfLines={2}
                        >
                            {location.short_description}
                        </Text>

                        {location.rating != null && (
                            <View style={styles.ratingPill}>
                                <Ionicons name="star" size={14} color="#facc15" />
                                <Text style={styles.ratingText}>{location.rating}</Text>
                            </View>
                        )}
                    </View>
                </View>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        borderWidth: 1,
        borderRadius: 16,
        overflow: "hidden",
    },
    img: {
        width: "100%",
        height: 180,
        backgroundColor: "#111827",
    },
    content: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        gap: 4,
    },
    rowTitle: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        marginBottom: 2,
    },
    title: { fontSize: 16, fontWeight: "700" },
    address: { fontSize: 12 },
    rowBottom: {
        flexDirection: "row",
        marginTop: 2,
        gap: 6,
    },
    desc: {
        flex: 1,
        fontSize: 12,
    },
    ratingPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 3,
        backgroundColor: "#111827",
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 999,
        alignSelf: "flex-start",
    },
    ratingText: { color: "#fefce8", fontSize: 11, fontWeight: "700" },
});
