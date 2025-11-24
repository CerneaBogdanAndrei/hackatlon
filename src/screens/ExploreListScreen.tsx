import { useEffect, useState } from "react";
import { FlatList, View, Text, Image, Pressable, ActivityIndicator } from "react-native";
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
    }));
}

export default function ExploreListScreen({ navigation }: any) {
    const [locations, setLocations] = useState<Location[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);

            try {
                const { data } = await supabase.from("locations").select("*").order("rating", { ascending: false });
                setLocations((data as Location[]) ?? getLocalLocations());
            } catch {
                setLocations(getLocalLocations());
            }

            try {
                const user = (await supabase.auth.getUser()).data.user;
                if (user) {
                    const { data } = await supabase
                        .from("favorites")
                        .select("location_id")
                        .eq("user_id", user.id);

                    setFavoriteIds((data ?? []).map((x) => x.location_id as string));
                }
            } catch {}

            setLoading(false);
        })();
    }, []);

    async function toggleFavorite(locationId: string) {
        const isFav = favoriteIds.includes(locationId);

        setFavoriteIds((prev) => (isFav ? prev.filter((id) => id !== locationId) : [...prev, locationId]));

        try {
            const user = (await supabase.auth.getUser()).data.user;
            if (!user) return;

            if (isFav) {
                await supabase.from("favorites").delete().eq("user_id", user.id).eq("location_id", locationId);
            } else {
                await supabase.from("favorites").insert({ user_id: user.id, location_id: locationId });
            }
        } catch {}
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                ListHeaderComponent={
                    <View style={{ padding: 12, flexDirection: "row", justifyContent: "space-between" }}>
                        <Text style={{ fontSize: 22, fontWeight: "800" }}>places</Text>

                        {/* Buton care te duce pe tab-ul map */}
                        <Pressable onPress={() => navigation.navigate("map")} style={{ flexDirection: "row", gap: 6 }}>
                            <Ionicons name="map" size={20} />
                            <Text>map</Text>
                        </Pressable>
                    </View>
                }
                data={locations}
                keyExtractor={(i) => i.id ?? i.name}
                renderItem={({ item }) => {
                    const canFav = !!item.id;
                    const isFav = canFav && favoriteIds.includes(item.id!);

                    return (
                        <View style={{ margin: 12, borderRadius: 16, overflow: "hidden", backgroundColor: "#111" }}>
                            {!!item.image_url && (
                                <Image source={{ uri: item.image_url }} style={{ height: 160, width: "100%" }} />
                            )}

                            <View style={{ padding: 12, gap: 6 }}>
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                    <Text style={{ color: "white", fontSize: 18, fontWeight: "700", flex: 1 }}>
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
                                {!!item.short_description && <Text style={{ color: "#ddd" }}>{item.short_description}</Text>}
                                <Text style={{ color: "white" }}>⭐ {item.rating}</Text>
                            </View>
                        </View>
                    );
                }}
            />
        </View>
    );
}
