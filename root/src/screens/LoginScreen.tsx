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
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";
import { useTheme } from "../theme/useTheme";

export default function LoginScreen() {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const [email, setEmail] = useState("exemplu@email.com");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function onLogin() {
        setError(null);

        if (!email.trim() || !password) {
            setError("Completează email și parola.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: email.trim(),
                password,
            });

            if (error) {
                setError(error.message ?? "Nu te-am putut loga. Încearcă din nou.");
                return;
            }

            // aici poți ajusta navigarea cum vrei
            navigation.navigate("tabs");
        } catch (e: any) {
            setError(e?.message ?? "A apărut o eroare neașteptată.");
        } finally {
            setLoading(false);
        }
    }

    function goRegister() {
        navigation.navigate("register");
    }

    function goForgot() {
        navigation.navigate("forgot");
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.bg }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.inner}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    bun venit 👋
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.subtext }]}>
                    loghează-te ca să salvezi favoritele și recomandările AI
                </Text>

                {error && (
                    <View style={[styles.errorBox, { borderColor: theme.colors.accent }]}>
                        <Text style={[styles.errorText, { color: theme.colors.accent }]}>
                            {error}
                        </Text>
                    </View>
                )}

                {/* EMAIL */}
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

                {/* PAROLĂ */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        parola
                    </Text>
                    <View
                        style={[
                            styles.passRow,
                            {
                                borderColor: theme.colors.border,
                                backgroundColor: theme.colors.card,
                            },
                        ]}
                    >
                        <TextInput
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry={!showPass}
                            placeholder="enter your password"
                            placeholderTextColor={theme.colors.subtext}
                            style={[styles.passInput, { color: theme.colors.text }]}
                        />
                        <Pressable onPress={() => setShowPass((s) => !s)}>
                            <Ionicons
                                name={showPass ? "eye-off" : "eye"}
                                size={20}
                                color={theme.colors.subtext}
                            />
                        </Pressable>
                    </View>
                </View>

                <Pressable onPress={goForgot} style={styles.forgotBtn}>
                    <Text style={[styles.forgotText, { color: theme.colors.subtext }]}>
                        ai uitat parola?
                    </Text>
                </Pressable>

                <Pressable
                    onPress={onLogin}
                    style={[
                        styles.primaryBtn,
                        { backgroundColor: theme.colors.primary },
                    ]}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.primaryText}>login</Text>
                    )}
                </Pressable>

                <View style={styles.bottomRow}>
                    <Text style={{ color: theme.colors.subtext }}>
                        nu ai cont încă?
                    </Text>
                    <Pressable onPress={goRegister}>
                        <Text style={{ color: theme.colors.accent, fontWeight: "700" }}>
                            creează cont
                        </Text>
                    </Pressable>
                </View>
            </View>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1 },
    inner: { flex: 1, padding: 20, justifyContent: "center" },
    title: { fontSize: 28, fontWeight: "800", marginBottom: 4 },
    subtitle: { fontSize: 14, marginBottom: 24 },
    field: { marginBottom: 14 },
    label: { fontSize: 13, marginBottom: 4 },
    input: {
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 12,
        paddingVertical: 10,
        fontSize: 14,
    },
    passRow: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderRadius: 10,
        paddingHorizontal: 10,
    },
    passInput: {
        flex: 1,
        paddingVertical: 10,
        fontSize: 14,
        marginRight: 8,
    },
    forgotBtn: { alignSelf: "flex-end", marginBottom: 18 },
    forgotText: { fontSize: 12, textDecorationLine: "underline" },
    primaryBtn: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginBottom: 16,
    },
    primaryText: { color: "#fff", fontWeight: "700", fontSize: 15 },
    bottomRow: {
        flexDirection: "row",
        gap: 6,
        justifyContent: "center",
        marginTop: 4,
    },
    errorBox: {
        borderWidth: 1,
        borderRadius: 10,
        padding: 8,
        marginBottom: 14,
    },
    errorText: { fontSize: 12 },
});
