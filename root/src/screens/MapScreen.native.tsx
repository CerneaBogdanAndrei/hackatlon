import { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getLocations } from "../services/locationsRepo";
import { getLikedIds, toggleLike } from "../services/likesRepo";
import LocationCard from "../components/LocationCard";

export type Location = {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    image_url?: string | null;
    short_description?: string | null;
    rating?: number | null;
};

const { height: SCREEN_H } = Dimensions.get("window");
const MAP_H = Math.round(SCREEN_H * 0.45);

export default function MapScreen() {
    const navigation = useNavigation<any>();

    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [likedIds, setLikedIds] = useState<number[]>([]);
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        let mounted = true;
        async function load() {
            try {
                setLoading(true);
                const data = await getLocations();
                if (mounted) setLocations(data);
            } finally {
                if (mounted) setLoading(false);
            }
        }
        load();
        return () => {
            mounted = false;
        };
    }, []);

    useEffect(() => {
        (async () => {
            const ids = await getLikedIds();
            setLikedIds(ids);
        })();
    }, []);

    const initialRegion: Region = useMemo(() => {
        if (locations.length > 0) {
            const first = locations[0];
            return {
                latitude: first.latitude,
                longitude: first.longitude,
                latitudeDelta: 0.25,
                longitudeDelta: 0.25,
            };
        }
        return {
            latitude: 45.9432,
            longitude: 24.9668,
            latitudeDelta: 4,
            longitudeDelta: 4,
        };
    }, [locations]);

    function openDetails(loc: Location) {
        setSelectedId(loc.id);
        navigation.navigate("details", { location: loc });
    }

    async function onToggleLike(loc: Location) {
        const newLiked = await toggleLike(loc);
        setLikedIds((prev) =>
            newLiked ? Array.from(new Set([...prev, loc.id])) : prev.filter((id) => id !== loc.id)
        );
    }

    if (loading) {
        return (
            <View style={styles.center}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 8 }}>loading locations...</Text>
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <MapView style={{ height: MAP_H }} initialRegion={initialRegion}>
                {locations.map((loc) => (
                    <Marker
                        key={loc.id}
                        coordinate={{ latitude: loc.latitude, longitude: loc.longitude }}
                        title={loc.name}
                        description={loc.address}
                        onPress={() => openDetails(loc)}
                    />
                ))}
            </MapView>

            {/* AI Floating Button -> navigare corectă spre tab */}
            <Pressable
                onPress={() =>
                    navigation.navigate("tabs", {
                        screen: "ai",
                        params: { prefill: "recomanda-mi un loc potrivit in orasul meu" },
                    })
                }
                style={styles.aiBtn}
            >
                <Ionicons name="sparkles" size={24} color="white" />
            </Pressable>

            <FlatList
                data={locations}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
                renderItem={({ item }) => (
                    <LocationCard
                        location={item}
                        liked={likedIds.includes(item.id)}
                        onPress={() => openDetails(item)}
                        onToggleLike={() => onToggleLike(item)}
                    />
                )}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    aiBtn: {
        position: "absolute",
        bottom: 110,
        right: 16,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#111",
        justifyContent: "center",
        alignItems: "center",
        shadowColor: "#000",
        shadowOpacity: 0.3,
        shadowRadius: 6,
        elevation: 6,
    },
});
