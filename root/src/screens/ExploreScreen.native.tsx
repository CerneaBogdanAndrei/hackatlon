import { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
    TextInput,
    Pressable,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { getLocations, type Location } from "../services/locationsRepo";
import { getLikedIds, toggleLike } from "../services/likesRepo";
import LocationCard from "../components/LocationCard";
import { useTheme } from "../theme/useTheme";

function normalize(text: string) {
    return text
        .toLowerCase()
        .replaceAll("ă", "a")
        .replaceAll("â", "a")
        .replaceAll("î", "i")
        .replaceAll("ș", "s")
        .replaceAll("ş", "s")
        .replaceAll("ț", "t")
        .replaceAll("ţ", "t");
}

// detectăm dacă e “restaurant” pe baza numelui/descriptiei
function isRestaurant(loc: Location) {
    const t = normalize(
        `${loc.name ?? ""} ${loc.short_description ?? ""} ${loc.address ?? ""}`
    );

    const keywords = [
        "restaurant",
        "bistro",
        "trattoria",
        "pizzeria",
        "burger",
        "inn",
        "pub",
        "house",
        "pescaresc",
        "grill",
        "diner",
    ];

    return keywords.some((k) => t.includes(k));
}

export default function ExploreScreen() {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const [locations, setLocations] = useState<Location[]>([]);
    const [likedIds, setLikedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    // 🔍 Search + Filters state
    const [query, setQuery] = useState("");
    const [onlyRestaurants, setOnlyRestaurants] = useState(false);
    const [ratingOver4, setRatingOver4] = useState(false);

    useEffect(() => {
        let mounted = true;
        (async () => {
            try {
                setLoading(true);
                const data = await getLocations();
                if (mounted) setLocations(data);
            } finally {
                if (mounted) setLoading(false);
            }
        })();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        (async () => setLikedIds(await getLikedIds()))();
    }, []);

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

    // ✅ filtrarea efectivă
    const filteredLocations = useMemo(() => {
        const q = normalize(query.trim());

        let arr = locations.slice();

        // search
        if (q.length > 0) {
            arr = arr.filter((loc) => {
                const hay = normalize(
                    `${loc.name ?? ""} ${loc.address ?? ""} ${loc.short_description ?? ""}`
                );
                return hay.includes(q);
            });
        }

        // only restaurants
        if (onlyRestaurants) {
            arr = arr.filter(isRestaurant);
        }

        // rating > 4
        if (ratingOver4) {
            arr = arr.filter((loc) => (loc.rating ?? 0) > 4);
        }

        return arr;
    }, [locations, query, onlyRestaurants, ratingOver4]);

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.bg }]}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 8, color: theme.colors.text }}>
                    loading...
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 12, backgroundColor: theme.colors.bg }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
                explore
            </Text>

            {/* 🔍 SEARCH BAR */}
            <TextInput
                value={query}
                onChangeText={setQuery}
                placeholder="caută locații..."
                placeholderTextColor={theme.colors.subtext}
                style={[
                    styles.search,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                        color: theme.colors.text,
                    },
                ]}
            />

            {/* FILTER CHIPS */}
            <View style={styles.filtersRow}>
                <Pressable
                    onPress={() => setOnlyRestaurants((v) => !v)}
                    style={[
                        styles.chip,
                        {
                            backgroundColor: onlyRestaurants
                                ? theme.colors.primary
                                : theme.colors.card,
                            borderColor: theme.colors.border,
                        },
                    ]}
                >
                    <Text
                        style={{
                            color: onlyRestaurants
                                ? theme.mode === "dark"
                                    ? "#000"
                                    : "#fff"
                                : theme.colors.text,
                            fontWeight: "800",
                            fontSize: 12,
                        }}
                    >
                        doar restaurante
                    </Text>
                </Pressable>

                <Pressable
                    onPress={() => setRatingOver4((v) => !v)}
                    style={[
                        styles.chip,
                        {
                            backgroundColor: ratingOver4
                                ? theme.colors.primary
                                : theme.colors.card,
                            borderColor: theme.colors.border,
                        },
                    ]}
                >
                    <Text
                        style={{
                            color: ratingOver4
                                ? theme.mode === "dark"
                                    ? "#000"
                                    : "#fff"
                                : theme.colors.text,
                            fontWeight: "800",
                            fontSize: 12,
                        }}
                    >
                        rating &gt; 4
                    </Text>
                </Pressable>

                {/* reset */}
                {(onlyRestaurants || ratingOver4 || query.length > 0) && (
                    <Pressable
                        onPress={() => {
                            setQuery("");
                            setOnlyRestaurants(false);
                            setRatingOver4(false);
                        }}
                        style={[
                            styles.chip,
                            {
                                backgroundColor: theme.colors.card,
                                borderColor: theme.colors.border,
                            },
                        ]}
                    >
                        <Text
                            style={{
                                color: theme.colors.subtext,
                                fontWeight: "800",
                                fontSize: 12,
                            }}
                        >
                            reset
                        </Text>
                    </Pressable>
                )}
            </View>

            <Text style={{ marginVertical: 6, color: theme.colors.subtext }}>
                rezultate: {filteredLocations.length}
            </Text>

            <FlatList
                data={filteredLocations}
                keyExtractor={(item, idx) => `${item.id}-${idx}`}
                contentContainerStyle={{ paddingBottom: 40 }}
                renderItem={({ item }) => (
                    <LocationCard
                        location={item}
                        liked={likedIds.includes(item.id)}
                        onPress={() => openDetails(item)}
                        onToggleLike={() => onToggleLike(item)}
                    />
                )}
                ListEmptyComponent={
                    <Text
                        style={{
                            textAlign: "center",
                            marginTop: 30,
                            color: theme.colors.subtext,
                        }}
                    >
                        nu am găsit nimic pentru filtrul tău 😕
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },

    search: {
        borderWidth: 1,
        borderRadius: 12,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 15,
    },

    filtersRow: {
        flexDirection: "row",
        gap: 8,
        marginTop: 8,
        flexWrap: "wrap",
    },

    chip: {
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 999,
    },
});
