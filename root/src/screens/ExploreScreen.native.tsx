import { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Pressable,
    Image,
    ActivityIndicator,
    StyleSheet,
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

export default function ExploreScreen() {
    const navigation = useNavigation<any>();
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

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
        setLoading(false);
    }, []);

    function openDetails(loc: Location) {
        navigation.navigate("details", { location: loc });
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
            <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 8 }}>
                explore
            </Text>

            <FlatList
                data={locations}
                keyExtractor={(item) => String(item.id)}
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

                            {item.rating != null && (
                                <View style={{ flexDirection: "row", alignItems: "center", marginTop: 6 }}>
                                    <Ionicons name="star" size={14} color="#111" />
                                    <Text style={{ marginLeft: 4, fontWeight: "700" }}>
                                        {item.rating}
                                    </Text>
                                </View>
                            )}
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
    center: { flex: 1, justifyContent: "center", alignItems: "center" },

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
    cardTitle: { fontSize: 16, fontWeight: "800" },
    cardAddr: { fontSize: 12, opacity: 0.7, marginTop: 2 },
    cardDesc: { fontSize: 13, marginTop: 6, opacity: 0.9 },
});
