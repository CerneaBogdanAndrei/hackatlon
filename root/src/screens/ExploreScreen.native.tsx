import { useEffect, useState } from "react";
import {
    View,
    Text,
    FlatList,
    Image,
    Pressable,
    ActivityIndicator,
} from "react-native";
import MapView, { Marker } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import rawLocations from "../../root/src/data/locations.json";
import { supabase } from "../lib/supabase";

type RawLocation = {
    name: string;
    address: string;
    coordinates: { lat: number; long: number };
    image_url: string;
    short_description: string;
    rating: number;
};

type Location = {
    id?: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    image_url?: string | null;
    short_description?: string | null;
    rating: number;
    city?: string | null;
};

function getLocalLocations(): Location[] {
    return (rawLocations as RawLocation[]).map((l) => ({
        name: l.name,
        address: l.address,
        latitude: l.coordinates.lat,
        longitude: l.coordinates.long,
        image_url: l.image_url,
        short_description: l.short_description,
        rating: l.rating,
        city: l.address.split(",").slice(-1)[0]?.trim() || null,
    }));
}

export default function ExploreScreen() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState<"supabase" | "local">("local");

    useEffect(() => {
        (async () => {
            setLoading(true);

            // 1) locations hybrid
            try {
                const { data, error } = await supabase
                    .from("locations")
                    .select("*")
                    .order("rating", { ascending: false });

                if (error) throw error;

                if (data && data.length > 0) {
                    setLocations(data as Location[]);
                    setSource("supabase");
                } else {
                    setLocations(getLocalLocations());
                    setSource("local");
                }
            } catch {
                setLocations(getLocalLocations());
                setSource("local");
            }

            // 2) favorites
            try {
                const user = (await supabase.auth.getUser()).data.user;
                if (user) {
                    const { data, error } = await supabase
                        .from("favorites")
                        .select("location_id")
                        .eq("user_id", user.id);

                    if (!error && data) {
                        setFavoriteIds(data.map((x) => x.location_id as string));
                    }
                }
            } catch {
                setFavoriteIds([]);
            }

            setLoading(false);
        })();
    }, []);

    async function toggleFavorite(locationId: string) {
        const isFav = favoriteIds.includes(locationId);

        // optimistic update
        setFavoriteIds((prev) =>
            isFav ? prev.filter((id) => id !== locationId) : [...prev, locationId]
        );

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            if (isFav) {
                const { error } = await supabase
                    .from("favorites")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("location_id", locationId);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from("favorites")
                    .insert({ user_id: user.id, location_id: locationId });
                if (error) throw error;
            }
        } catch {
            // rollback dacă a picat request-ul
            setFavoriteIds((prev) =>
                isFav ? [...prev, locationId] : prev.filter((id) => id !== locationId)
            );
        }
    }

    const first = locations[0];

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            {/* header */}
            <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 22, fontWeight: "700" }}>Explore</Text>
                <Text style={{ opacity: 0.6 }}>
                    source: {source} • {locations.length} places
                </Text>
            </View>

            {/* map */}
            {first && (
                <MapView
                    style={{ height: 260, width: "100%" }}
                    initialRegion={{
                        latitude: first.latitude,
                        longitude: first.longitude,
                        latitudeDelta: 0.18,
                        longitudeDelta: 0.18,
                    }}
                >
                    {locations.map((l) => (
                        <Marker
                            key={l.id ?? l.name}
                            coordinate={{ latitude: l.latitude, longitude: l.longitude }}
                            title={l.name}
                            description={l.address}
                        />
                    ))}
                </MapView>
            )}

            {/* list */}
            <FlatList
                data={locations}
                keyExtractor={(i) => i.id ?? i.name}
                renderItem={({ item }) => {
                    const canFav = !!item.id; // doar supabase are id stabil
                    const isFav = canFav && favoriteIds.includes(item.id!);

                    return (
                        <View
                            style={{
                                margin: 12,
                                borderRadius: 16,
                                overflow: "hidden",
                                backgroundColor: "#111",
                            }}
                        >
                            {!!item.image_url && (
                                <Image
                                    source={{ uri: item.image_url }}
                                    style={{ height: 160, width: "100%" }}
                                    resizeMode="cover"
                                />
                            )}

                            <View style={{ padding: 12, gap: 6 }}>
                                <View
                                    style={{
                                        flexDirection: "row",
                                        justifyContent: "space-between",
                                        alignItems: "center",
                                    }}
                                >
                                    <Text
                                        style={{
                                            color: "white",
                                            fontSize: 18,
                                            fontWeight: "700",
                                            flex: 1,
                                            paddingRight: 8,
                                        }}
                                    >
                                        {item.name}
                                    </Text>

                                    {canFav && (
                                        <Pressable onPress={() => toggleFavorite(item.id!)}>
                                            <Ionicons
                                                name={isFav ? "heart" : "heart-outline"}
                                                size={22}
                                                color={isFav ? "tomato" : "white"}
                                            />
                                        </Pressable>
                                    )}
                                </View>

                                <Text style={{ color: "#bbb" }}>{item.address}</Text>

                                {!!item.short_description && (
                                    <Text style={{ color: "#ddd" }}>
                                        {item.short_description}
                                    </Text>
                                )}

                                <Text style={{ color: "white" }}>⭐ {item.rating}</Text>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
}
