import { useEffect, useMemo, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    Image,
    ActivityIndicator,
    StyleSheet,
    Dimensions,
} from "react-native";
import MapView, { Marker, Region } from "react-native-maps";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";

import { getLocations } from "../services/locationsRepo";

// ajustează tipul dacă ai altul în locationsRepo
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
    const [selectedId, setSelectedId] = useState<number | null>(null);

    useEffect(() => {
        let mounted = true;

        async function load() {
            try {
                setLoading(true);
                const data = await getLocations();
                if (mounted) setLocations(data);
            } catch (e) {
                console.log("getLocations error:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        load();
        return () => {
            mounted = false;
        };
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

        // fallback Romania center
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
            {/* MAP */}
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

            {/* FLOATING AI BUTTON */}
            <Pressable
                onPress={() =>
                    navigation.navigate("ai", {
                        prefill: "recomanda-mi un loc potrivit in orasul meu",
                    })
                }
                style={styles.aiBtn}
            >
                <Ionicons name="sparkles" size={24} color="white" />
            </Pressable>

            {/* LIST */}
            <FlatList
                data={locations}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ padding: 12, paddingBottom: 40 }}
                renderItem={({ item }) => {
                    const selected = item.id === selectedId;

                    return (
                        <Pressable
                            onPress={() => openDetails(item)}
                            style={[
                                styles.card,
                                selected && { borderColor: "#111", borderWidth: 2 },
                            ]}
                        >
                            {!!item.image_url && (
                                <Image
                                    source={{ uri: item.image_url }}
                                    style={styles.cardImg}
                                />
                            )}

                            <View style={{ flex: 1 }}>
                                <Text style={styles.cardTitle}>{item.name}</Text>
                                <Text style={styles.cardAddr}>{item.address}</Text>

                                {!!item.short_description && (
                                    <Text style={styles.cardDesc} numberOfLines={2}>
                                        {item.short_description}
                                    </Text>
                                )}

                                {item.rating != null && (
                                    <Text style={styles.cardRating}>⭐ {item.rating}</Text>
                                )}
                            </View>
                        </Pressable>
                    );
                }}
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
    center: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },

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

    card: {
        flexDirection: "row",
        gap: 10,
        backgroundColor: "white",
        borderRadius: 14,
        padding: 10,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#eee",
    },

    cardImg: {
        width: 90,
        height: 90,
        borderRadius: 10,
        backgroundColor: "#f2f2f2",
    },

    cardTitle: {
        fontSize: 16,
        fontWeight: "800",
    },

    cardAddr: {
        fontSize: 12,
        opacity: 0.7,
        marginTop: 2,
    },

    cardDesc: {
        fontSize: 13,
        marginTop: 6,
        opacity: 0.9,
    },

    cardRating: {
        marginTop: 6,
        fontWeight: "700",
    },
});
