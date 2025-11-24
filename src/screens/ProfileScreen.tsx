import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../lib/supabase";
import { fetchFavoriteIds } from "../services/favoritesRepo";

export default function ProfileScreen() {
    const [email, setEmail] = useState<string | null>(null);
    const [favoritesCount, setFavoritesCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);

            const user = (await supabase.auth.getUser()).data.user;
            setEmail(user?.email ?? null);

            const favs = await fetchFavoriteIds();
            setFavoritesCount(favs.length);

            setLoading(false);
        })();
    }, []);

    async function signOut() {
        const { error } = await supabase.auth.signOut();
        if (error) Alert.alert("signout error", error.message);
    }

    if (loading) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <View style={{ flex: 1, padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 22, fontWeight: "800" }}>profile</Text>
            <Text style={{ opacity: 0.7 }}>email: {email ?? "-"}</Text>
            <Text style={{ opacity: 0.7 }}>favorites: {favoritesCount}</Text>

            <Pressable
                onPress={signOut}
                style={{
                    marginTop: 10,
                    backgroundColor: "#111",
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                }}
            >
                <Text style={{ color: "white", fontWeight: "700" }}>sign out</Text>
            </Pressable>
        </View>
    );
}
