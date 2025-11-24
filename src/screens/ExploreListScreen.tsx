import { useEffect, useState } from "react";
import {
    FlatList,
    View,
    Text,
    Image,
    Pressable,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { fetchLocationsHybrid, Location } from "../services/locationsRepo";
import {
    fetchFavoriteIds,
    addFavorite,
    removeFavorite,
} from "../services/favoritesRepo";

export default function ExploreListScreen({ navigation }: any) {
    const [locations, setLocations] = useState<Location[]>([]);
    const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [source, setSource] = useState<"supabase" | "local">("local");

    useEffect(() => {
        (async () => {
            setLoading(true);

            const res = await fetchLocationsHybrid();
            setLocations(res.locations);
            setSource(res.source);

            const favs = await fetchFavoriteIds();
            setFavoriteIds(favs);

            setLoading(false);
        })();
    }, []);

    async function toggleFavorite(locationId: string) {
        const isFav = favoriteIds.includes(locationId);

        setFavoriteIds((prev) =>
            isFav ? prev.filter((id) => id !== locationId) : [...prev, locationId]
        );

        try {
            if (isFav) await removeFavorite(locationId);
            else await addFavorite(locationId);
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
                    <View
                        style={{
                            padding: 12,
                            flexDirection: "row",
                            justifyContent: "space-between",
                            alignItems: "center",
                        }}
                    >
                        <View>
                            <Text style={{ fontSize: 22, fontWeight: "800" }}>places</Text>
                            <Text style={{ opacity: 0.6 }}>
                                source: {source} • {locations.length}
                            </Text>
                        </View>

                        {/* Buton sigur către tab-ul map */}
                        <Pressable
                            onPress={() => navigation.getParent()?.navigate("map")}
                            style={{ flexDirection: "row", gap: 6, alignItems: "center" }}
                        >
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
