import { View, Text, Image, ScrollView, StyleSheet, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { isLiked, toggleLike } from "../services/likesRepo";

export default function DetailsScreen({ route }: any) {
    const navigation = useNavigation<any>();
    const { location } = route.params;

    const [liked, setLiked] = useState(false);

    useEffect(() => {
        (async () => setLiked(await isLiked(location.id)))();
    }, [location.id]);

    async function onToggleLike() {
        const newLiked = await toggleLike(location);
        setLiked(newLiked);
    }

    function askAI() {
        const prefill =
            `Spune-mi mai multe despre "${location.name}". ` +
            `Descriere scurtă: ${location.short_description || "Nu există descriere."} ` +
            `Adresa: ${location.address}.`;

        navigation.navigate("tabs", {
            screen: "ai",
            params: { prefill },
        });
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 12 }}>
            {!!location.image_url && (
                <Image source={{ uri: location.image_url }} style={styles.img} />
            )}

            <View style={styles.rowTitle}>
                <Text style={styles.title}>{location.name}</Text>

                <Pressable onPress={onToggleLike} hitSlop={10}>
                    <Ionicons
                        name={liked ? "heart" : "heart-outline"}
                        size={26}
                        color={liked ? "#e11d48" : "#111"}
                    />
                </Pressable>
            </View>

            <Text style={styles.addr}>{location.address}</Text>

            {!!location.short_description && (
                <Text style={styles.desc}>{location.short_description}</Text>
            )}

            {location.rating != null && (
                <Text style={styles.rating}>⭐ {location.rating}</Text>
            )}

            <Pressable onPress={askAI} style={styles.aiBtn}>
                <Ionicons name="sparkles" size={18} color="white" />
                <Text style={styles.aiBtnText}>ask ai about this place</Text>
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    img: {
        width: "100%",
        height: 220,
        borderRadius: 14,
        backgroundColor: "#eee",
        marginBottom: 12,
    },
    rowTitle: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    title: { fontSize: 22, fontWeight: "800", flex: 1 },
    addr: { marginTop: 4, opacity: 0.7 },
    desc: { marginTop: 10, fontSize: 16, lineHeight: 22 },
    rating: { marginTop: 10, fontWeight: "800" },
    aiBtn: {
        marginTop: 16,
        backgroundColor: "#111",
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    aiBtnText: { color: "white", fontWeight: "700" },
});
