import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    StyleSheet,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { useTheme } from "../theme/useTheme";

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const [email, setEmail] = useState("exemplu@email.com");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    async function onSend() {
        setError(null);
        setInfo(null);

        if (!email.trim()) {
            setError("Introdu un email.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.resetPasswordForEmail(
                email.trim(),
                {
                    redirectTo: "https://example.com/reset", // poți pune URL-ul tău
                }
            );

            if (error) {
                setError(error.message ?? "Nu am reușit să trimit email-ul.");
                return;
            }

            setInfo(
                "Dacă email-ul există în sistem, vei primi un link de resetare a parolei."
            );
        } catch (e: any) {
            setError(e?.message ?? "A apărut o eroare neașteptată.");
        } finally {
            setLoading(false);
        }
    }

    function goBack() {
        navigation.goBack();
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.bg }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.inner}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    ai uitat parola? 🔑
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.subtext }]}>
                    introdu email-ul și îți trimitem un link de resetare
                </Text>

                {error && (
                    <View style={[styles.errorBox, { borderColor: theme.colors.accent }]}>
                        <Text style={[styles.errorText, { color: theme.colors.accent }]}>
                            {error}
                        </Text>
                    </View>
                )}
                {info && (
                    <View style={styles.infoBox}>
                        <Text style={[styles.infoText, { color: theme.colors.text }]}>
                            {info}
                        </Text>
                    </View>
                )}

                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        email
                    </Text>
                    <TextInput
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="exemplu@email.com"
                        placeholderTextColor={theme.colors.subtext}
                        style={[
                            styles.input,
                            {
                                borderColor: theme.colors.border,
                                color: theme.colors.text,
                                backgroundColor: theme.colors.card,
                            },
                        ]}
                    />
                </View>

                <Pressable
                    onPress={onSend}
                    style={[
                        styles.primaryBtn,
                        { backgroundColor: theme.colors.primary },
                    ]}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.primaryText}>trimite link</Text>
                    )}
                </Pressable>

                <Pressable onPress={goBack} style={styles.backBtn}>
                    <Text style={{ color: theme.colors.subtext }}>← înapoi la login</Text>
                </Pressable>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1, padding: 20, justifyContent: "center" },
    title: { fontSize: 24, fontWeight: "800", marginBottom: 4 },
    subtitle: { fontSize: 14, marginBottom: 18 },
    field: { marginBottom: 14 },
    label: { fontSize: 13, marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    primaryBtn: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: 8,
    },
    primaryText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    backBtn: { alignSelf: "center", marginTop: 6 },
    errorBox: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
        marginBottom: 10,
    },
    errorText: { fontSize: 12 },
    infoBox: {
        borderRadius: 10,
        padding: 8,
        marginBottom: 10,
        backgroundColor: "#22c55e33",
    },
    infoText: { fontSize: 12 },
});
