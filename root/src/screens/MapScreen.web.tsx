import { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getLocations, type Location } from "../services/locationsRepo";
import { getLikedIds, toggleLike } from "../services/likesRepo";
import LocationCard from "../components/LocationCard";
import { useTheme } from "../theme/useTheme";

export default function MapScreenWeb() {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const [locations, setLocations] = useState<Location[]>([]);
    const [likedIds, setLikedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    // încarcă locațiile
    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                setLoading(true);
                const data = await getLocations();
                if (mounted) {
                    setLocations(data);
                    if (data.length > 0) setSelectedId(data[0].id);
                }
            } catch (e) {
                console.log("MapScreenWeb getLocations error:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => {
            mounted = false;
        };
    }, []);

    // încarcă like-uri locale
    useEffect(() => {
        (async () => {
            const ids = await getLikedIds();
            setLikedIds(ids);
        })();
    }, []);

    const selected = useMemo(
        () => locations.find((l) => l.id === selectedId) ?? locations[0],
        [locations, selectedId]
    );

    const mapUrl = selected
        ? `https://www.google.com/maps?q=${selected.latitude},${selected.longitude}&z=15&output=embed`
        : null;

    function openDetails(loc: Location) {
        navigation.navigate("details", { location: loc });
    }

    async function onToggleLike(loc: Location) {
        const newLiked = await toggleLike(loc);
        setLikedIds((prev) =>
            newLiked
                ? Array.from(new Set([...prev, loc.id]))
                : prev.filter((id) => id !== loc.id)
        );
    }

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.bg }]}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 8, color: theme.colors.text }}>
                    loading locations...
                </Text>
            </View>
        );
    }

    return (
        <View style={[styles.root, { backgroundColor: theme.colors.bg }]}>
            <Text style={[styles.title, { color: theme.colors.text }]}>map (web)</Text>
            <Text style={[styles.subtitle, { color: theme.colors.subtext }]}>
                harta folosește Google Maps embed; selectează un loc din listă pentru a-l
                centra pe hartă
            </Text>

            {/* HARTA (iframe Google Maps) */}
            <View style={styles.mapContainer}>
                {mapUrl ? (
                    // @ts-ignore - iframe e doar pe web, react-native-web îl acceptă
                    <iframe
                        src={mapUrl}
                        style={{
                            border: 0,
                            width: "100%",
                            height: "100%",
                            borderRadius: 12,
                        }}
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                    />
                ) : (
                    <View style={[styles.center, { flex: 1 }]}>
                        <Text style={{ color: theme.colors.text }}>no map available</Text>
                    </View>
                )}
            </View>

            {/* BUTON AI (la fel ca pe mobil, dar web) */}
            <Pressable
                onPress={() =>
                    navigation.navigate("tabs", {
                        screen: "ai",
                        params: {
                            prefill: selected
                                ? `Recomandă-mi ceva similar cu ${selected.name} în apropiere.`
                                : "recomanda-mi un loc potrivit in orasul meu",
                        },
                    })
                }
                style={[
                    styles.aiBtn,
                    { backgroundColor: theme.colors.primary, borderColor: theme.colors.border },
                ]}
            >
                <Ionicons
                    name="sparkles"
                    size={18}
                    color={theme.mode === "dark" ? "#000" : "#fff"}
                />
                <Text
                    style={[
                        styles.aiBtnText,
                        { color: theme.mode === "dark" ? "#000" : "#fff" },
                    ]}
                >
                    ask ai
                </Text>
            </Pressable>

            {/* LISTA DE LOCAȚII */}
            <FlatList
                data={locations}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={({ item }) => (
                    <LocationCard
                        location={item}
                        liked={likedIds.includes(item.id)}
                        onPress={() => {
                            setSelectedId(item.id);
                            openDetails(item);
                        }}
                        onToggleLike={() => onToggleLike(item)}
                    />
                )}
                ListEmptyComponent={
                    <Text style={{ textAlign: "center", marginTop: 20, color: theme.colors.text }}>
                        no locations found
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        padding: 12,
    },
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    title: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
    subtitle: { fontSize: 13, opacity: 0.7, marginBottom: 10 },

    mapContainer: {
        height: 300,
        borderRadius: 12,
        overflow: "hidden",
        marginBottom: 10,
    },

    aiBtn: {
        alignSelf: "flex-end",
        marginBottom: 10,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 999,
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        borderWidth: 1,
    },
    aiBtnText: { fontWeight: "700", fontSize: 12 },
});
