import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    ScrollView,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { sendLocalChat } from "../services/chatRepo";

export default function ChatScreen({ route }: any) {
    const [message, setMessage] = useState(route?.params?.prefill ?? "");
    const [reply, setReply] = useState("");
    const [loading, setLoading] = useState(false);

    async function onSend() {
        if (!message.trim()) return;

        setLoading(true);
        setReply("");

        try {
            const r = await sendLocalChat(message.trim());
            setReply(r);
        } catch (e) {
            setReply(
                "Nu pot contacta serverul local. Verifică dacă rulează pe PC și că ai IP corect în .env."
            );
        } finally {
            setLoading(false);
        }
    }

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={{ flex: 1, padding: 12 }}>
                <Text style={{ fontSize: 22, fontWeight: "800", marginBottom: 8 }}>
                    AI recommendations ✨
                </Text>

                <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 12 }}>
                    {loading && <ActivityIndicator size="large" />}
                    {!!reply && (
                        <Text style={{ fontSize: 16, lineHeight: 22 }}>{reply}</Text>
                    )}
                </ScrollView>

                <View style={{ flexDirection: "row", gap: 8 }}>
                    <TextInput
                        placeholder="ex: o cafenea liniștită în Cluj pentru învățat"
                        value={message}
                        onChangeText={setMessage}
                        multiline
                        style={{
                            flex: 1,
                            borderWidth: 1,
                            borderColor: "#ddd",
                            borderRadius: 10,
                            padding: 10,
                            minHeight: 44,
                            maxHeight: 120,
                        }}
                    />
                    <Pressable
                        onPress={onSend}
                        style={{
                            backgroundColor: "#111",
                            paddingHorizontal: 16,
                            borderRadius: 10,
                            justifyContent: "center",
                            alignItems: "center",
                        }}
                    >
                        <Text style={{ color: "white", fontWeight: "700" }}>send</Text>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}
