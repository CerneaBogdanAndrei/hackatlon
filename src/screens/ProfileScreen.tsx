import { useEffect, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export default function ProfileScreen() {
    const [email, setEmail] = useState<string | null>(null);
    const [favoritesCount, setFavoritesCount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);

            const user = (await supabase.auth.getUser()).data.user;
            setEmail(user?.email ?? null);

            if (user) {
                const { data, error } = await supabase
                    .from("favorites")
                    .select("location_id", { count: "exact" })
                    .eq("user_id", user.id);

                if (!error) {
                    setFavoritesCount(data?.length ?? 0);
                }
            }

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
            <Text style={{ fontSize: 22, fontWeight: "700" }}>Profile</Text>

            <Text style={{ opacity: 0.7 }}>email: {email ?? "not logged in"}</Text>
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
                <Text style={{ color: "white", fontWeight: "600" }}>sign out</Text>
            </Pressable>
        </View>
    );
}
