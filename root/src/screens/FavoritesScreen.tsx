import { useCallback, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";

import { getFavorites, getLikedIds, toggleLike, type FavLocation } from "../services/likesRepo";
import LocationCard from "../components/LocationCard";
import { useTheme } from "../theme/useTheme";

export default function FavoritesScreen() {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [favorites, setFavorites] = useState<FavLocation[]>([]);
    const [likedIds, setLikedIds] = useState<number[]>([]);

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const favs = await getFavorites();
            const ids = await getLikedIds();
            setFavorites(favs);
            setLikedIds(ids);
        } catch (e) {
            console.log("Favorites load error:", e);
            setFavorites([]);
            setLikedIds([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useFocusEffect(
        useCallback(() => {
            load();
        }, [load])
    );

    function openDetails(loc: FavLocation) {
        navigation.navigate("details", { location: loc });
    }

    async function onToggleLike(loc: FavLocation) {
        const newLiked = await toggleLike(loc);

        if (!newLiked) {
            setFavorites((prev) => prev.filter((x) => x.id !== loc.id));
            setLikedIds((prev) => prev.filter((id) => id !== loc.id));
        } else {
            // rare case dacă dai like direct din favorites
            setFavorites((prev) => [loc, ...prev]);
            setLikedIds((prev) => Array.from(new Set([...prev, loc.id])));
        }
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

            <FlatList
                data={favorites}
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
                    <Text
                        style={{
                            textAlign: "center",
                            marginTop: 30,
                            color: theme.colors.subtext,
                        }}
                    >
                        nu ai favorite încă. apasă inimioara la o locație 😉
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "800", marginBottom: 8 },
});
