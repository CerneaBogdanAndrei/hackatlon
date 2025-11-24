import { useEffect, useMemo, useState } from "react";
import { FlatList, View, Text, Pressable, Image, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import rawLocations from "../data/locations.json";

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

            // 1) fetch locations hybrid
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

            // 2) fetch favorites for current user (if any)
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

        // optimistic UI
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
            // rollback
            setFavoriteIds((prev) =>
                isFav ? [...prev, locationId] : prev.filter((id) => id !== locationId)
            );
        }
    }

    const header = useMemo(
        () => (
            <View style={{ padding: 12 }}>
                <Text style={{ fontSize: 22, fontWeight: "700" }}>Explore</Text>
                <Text style={{ opacity: 0.6 }}>
                    source: {source} • {locations.length} places
                </Text>
            </View>
        ),
        [source, locations.length]
    );

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <FlatList
            ListHeaderComponent={header}
            data={locations}
            keyExtractor={(i) => i.id ?? i.name}
            renderItem={({ item }) => {
                const canFav = !!item.id; // doar ce vine din supabase are id
                const isFav = canFav && favoriteIds.includes(item.id!);

                return (
                    <View
                        style={{
                            marginHorizontal: 12,
                            marginBottom: 12,
                            borderRadius: 16,
                            overflow: "hidden",
                            backgroundColor: "#111",
                        }}
                    >
                        {item.image_url ? (
                            <Image source={{ uri: item.image_url }} style={{ height: 180, width: "100%" }} />
                        ) : null}

                        <View style={{ padding: 12, gap: 6 }}>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text style={{ color: "white", fontSize: 18, fontWeight: "700", flex: 1, paddingRight: 8 }}>
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

                            {item.short_description ? (
                                <Text style={{ color: "#ddd" }}>{item.short_description}</Text>
                            ) : null}

                            <Text style={{ color: "white" }}>⭐ {item.rating}</Text>
                        </View>
                    </View>
                );
            }}
        />
    );
}
