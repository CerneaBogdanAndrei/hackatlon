import { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    Image,
    StyleSheet,
    Linking,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import rawLocations from "../data/locations.json";

type RawLocation = {
    name: string;
    address: string;
    coordinates: { lat: number; long: number };
    image_url?: string;
    short_description?: string;
    rating?: number;
};

type Location = {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    image_url?: string | null;
    short_description?: string | null;
    rating?: number | null;
};

export default function ExploreScreenWeb() {
    const navigation = useNavigation<any>();
    const [locations, setLocations] = useState<Location[]>([]);

    useEffect(() => {
        const normalized: Location[] = (rawLocations as RawLocation[]).map((l, i) => ({
            id: i + 1,
            name: l.name,
            address: l.address,
            latitude: l.coordinates.lat,
            longitude: l.coordinates.long,
            image_url: l.image_url ?? null,
            short_description: l.short_description ?? null,
            rating: l.rating ?? null,
        }));

        setLocations(normalized);
    }, []);

    function openDetails(loc: Location) {
        navigation.navigate("details", { location: loc });
    }

    function openInMaps(loc: Location) {
        const url = `https://www.google.com/maps/search/?api=1&query=${loc.latitude},${loc.longitude}`;
        Linking.openURL(url);
    }

    return (
        <View style={{ flex: 1, padding: 12 }}>
            <Text style={styles.title}>explore (web)</Text>
            <Text style={styles.subtitle}>
                pe web afișăm doar lista (harta e doar pe mobil).
            </Text>

            <FlatList
                data={locations}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={{ paddingBottom: 30 }}
                renderItem={({ item }) => (
                    <Pressable onPress={() => openDetails(item)} style={styles.card}>
                        {!!item.image_url && (
                            <Image source={{ uri: item.image_url }} style={styles.cardImg} />
                        )}

                        <View style={{ flex: 1 }}>
                            <Text style={styles.cardTitle}>{item.name}</Text>
                            <Text style={styles.cardAddr}>{item.address}</Text>

                            {!!item.short_description && (
                                <Text style={styles.cardDesc} numberOfLines={2}>
                                    {item.short_description}
                                </Text>
                            )}

                            <View style={styles.row}>
                                {item.rating != null && (
                                    <View style={styles.ratingBox}>
                                        <Ionicons name="star" size={14} color="#111" />
                                        <Text style={styles.ratingText}>{item.rating}</Text>
                                    </View>
                                )}

                                <Pressable
                                    onPress={() => openInMaps(item)}
                                    style={styles.mapsBtn}
                                >
                                    <Ionicons name="location-outline" size={16} color="white" />
                                    <Text style={styles.mapsBtnText}>open in maps</Text>
                                </Pressable>
                            </View>
                        </View>
                    </Pressable>
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
    title: {
        fontSize: 22,
        fontWeight: "800",
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 13,
        opacity: 0.7,
        marginBottom: 10,
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
        width: 100,
        height: 100,
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

    row: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 8,
    },

    ratingBox: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
    },
    ratingText: {
        fontWeight: "700",
    },

    mapsBtn: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#111",
        paddingHorizontal: 10,
        paddingVertical: 6,
        borderRadius: 8,
    },
    mapsBtnText: {
        color: "white",
        fontWeight: "700",
        fontSize: 12,
    },
});
