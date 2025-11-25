import { View, Text, Image, ScrollView, StyleSheet, Pressable, ActivityIndicator, Alert } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";

import { isLiked, toggleLike } from "../services/likesRepo";
import { useTheme } from "../theme/useTheme";

export default function DetailsScreen({ route }: any) {
    const navigation = useNavigation<any>();
    const { location } = route.params;
    const theme = useTheme();

    const [liked, setLiked] = useState(false);

    const [desc, setDesc] = useState<string>(location.short_description || "");
    const [vibeLoading, setVibeLoading] = useState(false);

    const API_URL = process.env.EXPO_PUBLIC_LOCAL_API_URL; // ex: http://192.168.3.118:3001

    useEffect(() => {
        (async () => setLiked(await isLiked(location.id)))();
    }, [location.id]);

    async function onToggleLike() {
        const newLiked = await toggleLike(location);
        setLiked(newLiked);
    }

    async function generateVibe() {
        if (!API_URL) {
            Alert.alert("error", "EXPO_PUBLIC_LOCAL_API_URL nu e setat");
            return;
        }

        try {
            setVibeLoading(true);

            const r = await fetch(`${API_URL}/api/vibe`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ location }),
            });

            if (!r.ok) {
                const t = await r.text();
                throw new Error(t);
            }

            const { vibe } = await r.json();
            if (vibe) setDesc(vibe);
        } catch (e: any) {
            console.log("generate vibe error:", e);
            Alert.alert("error", "nu am putut genera vibe acum");
        } finally {
            setVibeLoading(false);
        }
    }

    return (
        <ScrollView contentContainerStyle={{ padding: 12, backgroundColor: theme.colors.bg }}>
            {!!location.image_url && (
                <Image source={{ uri: location.image_url }} style={styles.img} />
            )}

            <View style={styles.rowTitle}>
                <Text style={[styles.title, { color: theme.colors.text }]}>{location.name}</Text>

                <Pressable onPress={onToggleLike} hitSlop={10}>
                    <Ionicons
                        name={liked ? "heart" : "heart-outline"}
                        size={26}
                        color={liked ? theme.colors.accent : theme.colors.text}
                    />
                </Pressable>
            </View>

            <Text style={[styles.addr, { color: theme.colors.subtext }]}>{location.address}</Text>

            {!!desc && (
                <Text style={[styles.desc, { color: theme.colors.text }]}>
                    {desc}
                </Text>
            )}

            {location.rating != null && (
                <Text style={[styles.rating, { color: theme.colors.text }]}>
                    ⭐ {location.rating}
                </Text>
            )}

            {/* ✨ Buton Vibe */}
            <Pressable
                onPress={generateVibe}
                disabled={vibeLoading}
                style={[
                    styles.vibeBtn,
                    { backgroundColor: theme.colors.primary, opacity: vibeLoading ? 0.6 : 1 },
                ]}
            >
                {vibeLoading ? (
                    <ActivityIndicator />
                ) : (
                    <>
                        <Ionicons name="sparkles" size={18} color={theme.mode === "dark" ? "#000" : "#fff"} />
                        <Text style={[styles.vibeBtnText, { color: theme.mode === "dark" ? "#000" : "#fff" }]}>
                            generează descriere vibe
                        </Text>
                    </>
                )}
            </Pressable>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    img: {
        width: "100%",
        height: 240,
        borderRadius: 14,
        backgroundColor: "#222",
        marginBottom: 12,
    },
    rowTitle: {
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 8,
    },
    title: { fontSize: 22, fontWeight: "800", flex: 1 },
    addr: { marginTop: 4, opacity: 0.9 },
    desc: { marginTop: 10, fontSize: 16, lineHeight: 22 },
    rating: { marginTop: 10, fontWeight: "800" },
    vibeBtn: {
        marginTop: 16,
        paddingVertical: 10,
        borderRadius: 10,
        flexDirection: "row",
        gap: 8,
        alignItems: "center",
        justifyContent: "center",
    },
    vibeBtnText: { fontWeight: "800" },
});
