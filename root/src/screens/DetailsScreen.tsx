import {
    View,
    Text,
    ScrollView,
    StyleSheet,
    Pressable,
    Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";

import { isLiked, toggleLike } from "../services/likesRepo";
import { useTheme } from "../theme/useTheme";

const WHATSAPP_PHONE = "+40712345678"; // TODO: schimbă cu numărul tău real (format internațional)

/**
 * Construiește mesajul și linkul de WhatsApp pentru rezervare.
 */
function buildWhatsappUrl(location: any) {
    const text = encodeURIComponent(
        `Bună! Aș vrea să fac o rezervare la "${location.name}" (adresa: ${location.address}). Aveți o masă liberă în seara asta?`
    );

    // wa.me acceptă doar cifre, fără +
    const cleanPhone = WHATSAPP_PHONE.replace(/[^\d]/g, "");
    return `https://wa.me/${cleanPhone}?text=${text}`;
}

export default function DetailsScreen({ route }: any) {
    const navigation = useNavigation<any>();
    const { location } = route.params;
    const theme = useTheme();

    const [liked, setLiked] = useState(false);

    useEffect(() => {
        (async () => setLiked(await isLiked(location.id)))();
    }, [location.id]);

    async function onToggleLike() {
        const newLiked = await toggleLike(location);
        setLiked(newLiked);
    }

    async function onReserve() {
        try {
            const url = buildWhatsappUrl(location);
            await Linking.openURL(url);
        } catch (e) {
            console.log("whatsapp open error", e);
        }
    }

    function onAiMagic() {
        const prefill =
            `Imaginează-ți că sunt client și vreau să înțeleg mai bine locul "${location.name}". ` +
            `Descriere scurtă: ${location.short_description || "Nu există descriere."} ` +
            `Adresa: ${location.address}. ` +
            `Te rog să-mi descrii pe larg atmosfera, ce tip de oameni vin aici, în ce situații s-ar potrivi (învățat, întâlnire romantică, seară cu prietenii) și ce aș putea încerca.`;

        navigation.navigate("tabs", {
            screen: "ai",
            params: { prefill },
        });
    }

    return (
        <ScrollView
            contentContainerStyle={[
                styles.container,
                { backgroundColor: theme.colors.bg },
            ]}
        >
            {/* Poză mare cu animație shared element */}
            {!!location.image_url && (
                <Animated.Image
                    sharedTransitionTag={`loc-img-${location.id}`}
                    source={{ uri: location.image_url }}
                    style={styles.img}
                />
            )}

            {/* Titlu + inimioară + rating */}
            <View style={styles.rowTitle}>
                <View style={{ flex: 1 }}>
                    <Animated.Text
                        sharedTransitionTag={`loc-title-${location.id}`}
                        style={[styles.title, { color: theme.colors.text }]}
                    >
                        {location.name}
                    </Animated.Text>

                    <Animated.Text
                        entering={FadeInDown.duration(300)}
                        style={[styles.addr, { color: theme.colors.subtext }]}
                    >
                        {location.address}
                    </Animated.Text>
                </View>

                <View style={styles.rightCol}>
                    {location.rating != null && (
                        <View style={styles.ratingPill}>
                            <Ionicons name="star" size={16} color="#facc15" />
                            <Text style={styles.ratingText}>{location.rating}</Text>
                        </View>
                    )}

                    <Pressable onPress={onToggleLike} hitSlop={10}>
                        <Ionicons
                            name={liked ? "heart" : "heart-outline"}
                            size={26}
                            color={liked ? theme.colors.accent : theme.colors.text}
                        />
                    </Pressable>
                </View>
            </View>

            {/* Descriere inițială */}
            {!!location.short_description && (
                <Animated.Text
                    entering={FadeIn.duration(350)}
                    style={[styles.desc, { color: theme.colors.text }]}
                >
                    {location.short_description}
                </Animated.Text>
            )}

            {/* Butoane: Rezervă + AI Magic */}
            <Animated.View
                entering={FadeInDown.duration(400)}
                style={styles.buttonsRow}
            >
                <Pressable
                    onPress={onReserve}
                    style={[
                        styles.reserveBtn,
                        { backgroundColor: "#25D366" }, // culoare WhatsApp
                    ]}
                >
                    <Ionicons name="logo-whatsapp" size={18} color="#fff" />
                    <Text style={styles.reserveText}>rezervă pe WhatsApp</Text>
                </Pressable>

                <Pressable
                    onPress={onAiMagic}
                    style={[
                        styles.aiBtn,
                        { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
                    ]}
                >
                    <Ionicons
                        name="sparkles"
                        size={18}
                        color={theme.colors.text}
                    />
                    <Text style={[styles.aiText, { color: theme.colors.text }]}>
                        ai magic
                    </Text>
                </Pressable>
            </Animated.View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { padding: 12 },
    img: {
        width: "100%",
        height: 260,
        borderRadius: 16,
        backgroundColor: "#222",
        marginBottom: 14,
    },
    rowTitle: {
        flexDirection: "row",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 10,
        marginBottom: 8,
    },
    rightCol: {
        alignItems: "flex-end",
        gap: 6,
    },
    title: { fontSize: 22, fontWeight: "800" },
    addr: { marginTop: 2, fontSize: 13 },
    desc: { marginTop: 12, fontSize: 15, lineHeight: 22 },

    ratingPill: {
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        backgroundColor: "#1f2937",
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
    },
    ratingText: { color: "#fefce8", fontWeight: "700", fontSize: 13 },

    buttonsRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
        marginTop: 18,
    },
    reserveBtn: {
        flex: 1.3,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 8,
        paddingVertical: 10,
        borderRadius: 999,
    },
    reserveText: {
        color: "#fff",
        fontWeight: "700",
        fontSize: 14,
    },
    aiBtn: {
        flex: 1,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        gap: 6,
        paddingVertical: 10,
        borderRadius: 999,
        borderWidth: 1,
    },
    aiText: {
        fontWeight: "700",
        fontSize: 13,
        textTransform: "uppercase",
        letterSpacing: 0.4,
    },
});
