import { useCallback, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet } from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { getLocations, type Location } from "../services/locationsRepo";
import { getLikedIds, toggleLike } from "../services/likesRepo";
import LocationCard from "../components/LocationCard";
import { useTheme } from "../theme/useTheme";

export default function FavoritesScreen() {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [likedIds, setLikedIds] = useState<number[]>([]);
    const [favLocations, setFavLocations] = useState<Location[]>([]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const [allLocations, ids] = await Promise.all([
                getLocations(),
                getLikedIds(),
            ]);

            setLikedIds(ids);
            setFavLocations(allLocations.filter((l) => ids.includes(l.id)));
        } catch (e) {
            console.log("Favorites load error:", e);
            setLikedIds([]);
            setFavLocations([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Refacem lista de fiecare dată când intri în tab
    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    function openDetails(loc: Location) {
        navigation.navigate("details", { location: loc });
    }

    async function onToggleLike(loc: Location) {
        const newLiked = await toggleLike(loc);

        const nextIds = newLiked
            ? Array.from(new Set([...likedIds, loc.id]))
            : likedIds.filter((id) => id !== loc.id);

        setLikedIds(nextIds);
        setFavLocations((prev) =>
            newLiked ? prev : prev.filter((x) => x.id !== loc.id)
        );
    }

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.bg }]}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 8, color: theme.colors.text }}>
                    loading favorites...
                </Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 12, backgroundColor: theme.colors.bg }}>
            <Text style={[styles.title, { color: theme.colors.text }]}>
                favorites ❤️
            </Text>
            <Text style={[styles.subtitle, { color: theme.colors.subtext }]}>
                aici ai toate locațiile salvate cu inimioară
            </Text>

            <FlatList
                data={favLocations}
                keyExtractor={(item) => String(item.id)}
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
                    <Text style={{ textAlign: "center", marginTop: 30, color: theme.colors.subtext }}>
                        nu ai favorite încă. apasă inimioara la o locație 😉
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
    subtitle: { fontSize: 13, opacity: 0.8, marginBottom: 10 },
});
