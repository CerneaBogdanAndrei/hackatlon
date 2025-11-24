import { useEffect, useState } from "react";
import { FlatList, View, Text, Image, ActivityIndicator } from "react-native";
import rawLocations from "../data/locations.json";
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

export default function ExploreScreen() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState<"supabase" | "local">("local");

    useEffect(() => {
        (async () => {
            setLoading(true);
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
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <FlatList
            ListHeaderComponent={
                <View style={{ padding: 12 }}>
                    <Text style={{ fontSize: 22, fontWeight: "700" }}>Explore</Text>
                    <Text style={{ opacity: 0.6 }}>
                        source: {source} • {locations.length} places
                    </Text>
                </View>
            }
            data={locations}
            keyExtractor={(i) => i.id ?? i.name}
            renderItem={({ item }) => (
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
                        <Text style={{ color: "white", fontSize: 18, fontWeight: "700" }}>
                            {item.name}
                        </Text>
                        <Text style={{ color: "#bbb" }}>{item.address}</Text>
                        {!!item.short_description && (
                            <Text style={{ color: "#ddd" }}>{item.short_description}</Text>
                        )}
                        <Text style={{ color: "white" }}>⭐ {item.rating}</Text>
                    </View>
                </View>
            )}
        />
    );
}
