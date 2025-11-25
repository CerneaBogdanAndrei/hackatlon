import { useEffect, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    FlatList,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { RouteProp, useRoute } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import NetInfo from "@react-native-community/netinfo";
import { useTheme } from "../theme/useTheme";

type ChatMessage = {
    id: string;
    from: "user" | "ai";
    text: string;
};

type AiTabRoute = RouteProp<
    Record<string, { prefill?: string } | undefined>,
    string
>;

export default function ChatScreen() {
    const theme = useTheme();
    const route = useRoute<AiTabRoute>();

    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isOffline, setIsOffline] = useState(false);

    useEffect(() => {
        const prefill = route.params?.prefill;
        if (prefill) {
            setInput(prefill);
        }
    }, [route.params]);

    useEffect(() => {
        const sub = NetInfo.addEventListener((state) => {
            const off = !(state.isConnected && state.isInternetReachable !== false);
            setIsOffline(off);
        });
        return () => sub();
    }, []);

    function pushMessage(from: "user" | "ai", text: string) {
        setMessages((prev) => [
            ...prev,
            { id: `${Date.now()}-${Math.random()}`, from, text },
        ]);
    }

    async function onSend() {
        const trimmed = input.trim();
        if (!trimmed || loading) return;

        setError(null);
        pushMessage("user", trimmed);
        setInput("");

        if (isOffline) {
            pushMessage(
                "ai",
                "Momentan ești offline. Folosesc doar informațiile locale: uită-te pe hartă și pe lista de locații, iar pentru detalii mai multe poți reveni când ai internet. 😊"
            );
            return;
        }

        setLoading(true);
        try {
            const baseUrl =
                process.env.EXPO_PUBLIC_LOCAL_API_URL || "http://192.168.3.118:3000";

            const res = await fetch(`${baseUrl}/api/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: trimmed }),
            });

            if (!res.ok) {
                const text = await res.text();
                console.log("chat api not ok:", res.status, text);
                setError("Nu pot vorbi cu AI-ul acum. Încearcă din nou puțin mai târziu.");
                pushMessage(
                    "ai",
                    "Se pare că serverul meu local de AI nu răspunde. Poți totuși să te uiți pe hartă și pe recomandările din listă între timp. 🙂"
                );
                return;
            }

            const json = await res.json();
            const reply = json.reply || "Nu am un răspuns clar acum.";
            pushMessage("ai", reply);
        } catch (e: any) {
            console.log("chat api error:", e);
            setError("Nu am putut contacta serverul de AI.");
            pushMessage(
                "ai",
                "S-a întrerupt conexiunea cu AI-ul. Verifică dacă serverul local rulează și dacă ești conectat la aceeași rețea."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.bg }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.inner}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    ai helper 🧠
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.subtext }]}>
                    întreabă ceva de genul: „vreau o cafenea liniștită în Cluj pentru
                    învățat” sau „unde aș mânca un burger bun în București?”
                </Text>

                {error && (
                    <View style={[styles.errorBox, { borderColor: theme.colors.accent }]}>
                        <Text style={[styles.errorText, { color: theme.colors.accent }]}>
                            {error}
                        </Text>
                    </View>
                )}

                <FlatList
                    data={messages}
                    keyExtractor={(item) => item.id}
                    contentContainerStyle={{ paddingVertical: 8 }}
                    renderItem={({ item }) => (
                        <View
                            style={[
                                styles.bubble,
                                item.from === "user" ? styles.bubbleUser : styles.bubbleAi,
                                {
                                    backgroundColor:
                                        item.from === "user"
                                            ? theme.colors.primary
                                            : theme.colors.card,
                                },
                            ]}
                        >
                            <Text
                                style={[
                                    styles.bubbleText,
                                    {
                                        color:
                                            item.from === "user" ? "#fff" : theme.colors.text,
                                    },
                                ]}
                            >
                                {item.text}
                            </Text>
                        </View>
                    )}
                    ListEmptyComponent={
                        <Text
                            style={{
                                textAlign: "center",
                                marginTop: 20,
                                color: theme.colors.subtext,
                            }}
                        >
                            începe conversația scriind un mesaj jos 👇
                        </Text>
                    }
                />

                <View
                    style={[
                        styles.inputRow,
                        { borderColor: theme.colors.border, backgroundColor: theme.colors.card },
                    ]}
                >
                    <TextInput
                        value={input}
                        onChangeText={setInput}
                        placeholder="scrie un mesaj către ai..."
                        placeholderTextColor={theme.colors.subtext}
                        style={[styles.input, { color: theme.colors.text }]}
                        multiline
                    />
                    <Pressable
                        onPress={onSend}
                        style={styles.sendBtn}
                        disabled={loading || !input.trim()}
                    >
                        {loading ? (
                            <ActivityIndicator size="small" color="#fff" />
                        ) : (
                            <Ionicons name="send" size={18} color="#fff" />
                        )}
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1, padding: 12, paddingBottom: 8 },
    title: { fontSize: 20, fontWeight: "800", marginBottom: 4 },
    subtitle: { fontSize: 12, marginBottom: 8 },
    errorBox: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
        marginBottom: 6,
    },
    errorText: { fontSize: 12 },
    bubble: {
        paddingHorizontal: 10,
        paddingVertical: 8,
        borderRadius: 12,
        marginVertical: 3,
        maxWidth: "85%",
    },
    bubbleUser: {
        alignSelf: "flex-end",
    },
    bubbleAi: {
        alignSelf: "flex-start",
    },
    bubbleText: { fontSize: 14 },
    inputRow: {
        flexDirection: "row",
        alignItems: "center",
        borderRadius: 999,
        borderWidth: 1,
        paddingHorizontal: 10,
        paddingVertical: 4,
        marginTop: 4,
    },
    input: {
        flex: 1,
        fontSize: 14,
        maxHeight: 90,
    },
    sendBtn: {
        marginLeft: 8,
        borderRadius: 999,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: "#111827",
    },
});
