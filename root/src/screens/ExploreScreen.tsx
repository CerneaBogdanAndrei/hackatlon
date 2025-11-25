import { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    ActivityIndicator,
    StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

import { getLocations, type Location } from "../services/locationsRepo";
import { getLikedIds, toggleLike } from "../services/likesRepo";
import LocationCard from "../components/LocationCard";

export default function ExploreScreen() {
    const navigation = useNavigation<any>();

    const [locations, setLocations] = useState<Location[]>([]);
    const [likedIds, setLikedIds] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);

    // încarcă locațiile (Supabase + fallback local)
    useEffect(() => {
        let mounted = true;

        async function loadLocations() {
            try {
                setLoading(true);
                const data = await getLocations();
                if (mounted) setLocations(data);
            } catch (e) {
                console.log("Explore getLocations error:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadLocations();
        return () => {
            mounted = false;
        };
    }, []);

    // încarcă like-urile locale
    useEffect(() => {
        (async () => {
            const ids = await getLikedIds();
            setLikedIds(ids);
        })();
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

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 8 }}>loading...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 12 }}>
            <Text style={styles.title}>explore</Text>
            <Text style={styles.subtitle}>
                apasă pe inimioară ca să salvezi locația la favorite
            </Text>

            <FlatList
                data={locations}
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
                    <Text style={{ textAlign: "center", marginTop: 20 }}>
                        no locations found
                    </Text>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    title: { fontSize: 22, fontWeight: "800", marginBottom: 4 },
    subtitle: { fontSize: 13, opacity: 0.7, marginBottom: 10 },
});
