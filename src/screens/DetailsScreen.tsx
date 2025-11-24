import React, { useState } from "react";
import {
    View,
    Text,
    Image,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    Linking,
    ScrollView,
} from "react-native";
import type { Location } from "../services/localLocations";

async function generateVibe(desc: string, name: string) {
    // placeholder simplu: înlocuiești cu API-ul vostru AI
    return `✨ ${name} vibe: ${desc} Perfect pentru un moment chill cu prietenii!`;
}

export default function DetailsScreen({ route }: any) {
    const loc: Location = route.params.location;
    const [desc, setDesc] = useState(loc.short_description);
    const [loading, setLoading] = useState(false);

    const onReserve = () => {
        const msg = `Salut! Vreau o rezervare la ${loc.name}.`;
        const url = `https://wa.me/?text=${encodeURIComponent(msg)}`;
        Linking.openURL(url);
    };

    const onVibe = async () => {
        setLoading(true);
        try {
            const vibe = await generateVibe(desc, loc.name);
            setDesc(vibe);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={{ flex: 1 }}>
            <Image source={{ uri: loc.image_url }} style={styles.hero} />

            <View style={styles.content}>
                <Text style={styles.title}>{loc.name}</Text>
                <Text style={styles.addr}>{loc.address}</Text>
                <Text style={styles.rating}>⭐ {loc.rating}</Text>

                <Text style={styles.desc}>{desc}</Text>

                <Pressable style={styles.btn} onPress={onReserve}>
                    <Text style={styles.btnText}>Rezervă (WhatsApp)</Text>
                </Pressable>

                <Pressable style={styles.btnAlt} onPress={onVibe} disabled={loading}>
                    {loading ? (
                        <ActivityIndicator />
                    ) : (
                        <Text style={styles.btnAltText}>Generează Descriere Vibe</Text>
                    )}
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    hero: { width: "100%", height: 260 },
    content: { padding: 14 },
    title: { fontSize: 22, fontWeight: "800" },
    addr: { color: "#666", marginTop: 4 },
    rating: { marginTop: 6, fontWeight: "700" },
    desc: { marginTop: 12, fontSize: 15, lineHeight: 21 },
    btn: {
        marginTop: 14,
        backgroundColor: "#111",
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    btnText: { color: "white", fontWeight: "800" },
    btnAlt: {
        marginTop: 10,
        backgroundColor: "#eee",
        padding: 12,
        borderRadius: 12,
        alignItems: "center",
    },
    btnAltText: { fontWeight: "800" },
});
