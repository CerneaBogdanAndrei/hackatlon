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

function validatePassword(p: string) {
    const rules = {
        length: p.length >= 8,
        upper: /[A-Z]/.test(p),
        digit: /[0-9]/.test(p),
        special: /[^A-Za-z0-9]/.test(p),
    };
    const ok = rules.length && rules.upper && rules.digit && rules.special;
    return { ok, rules };
}

export default function RegisterScreen() {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const [email, setEmail] = useState("exemplu@email.com");
    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [info, setInfo] = useState<string | null>(null);

    const { ok, rules } = validatePassword(password);

    async function onRegister() {
        setError(null);
        setInfo(null);

        if (!email.trim() || !password || !confirm) {
            setError("Completează toate câmpurile.");
            return;
        }
        if (password !== confirm) {
            setError("Parolele nu coincid.");
            return;
        }
        if (!ok) {
            setError("Parola nu respectă condițiile de mai jos.");
            return;
        }

        setLoading(true);
        try {
            const { error } = await supabase.auth.signUp({
                email: email.trim(),
                password,
            });

            if (error) {
                setError(error.message ?? "Nu am reușit să creez contul.");
                return;
            }

            setInfo(
                "Cont creat. Verifică email-ul pentru a confirma contul, apoi te poți loga."
            );
        } catch (e: any) {
            setError(e?.message ?? "A apărut o eroare neașteptată.");
        } finally {
            setLoading(false);
        }
    }

    function goLogin() {
        navigation.goBack();
    }

    function bullet(label: string, active: boolean) {
        return (
            <View style={styles.ruleRow}>
                <Ionicons
                    name={active ? "checkmark-circle" : "ellipse-outline"}
                    size={16}
                    color={active ? "#22c55e" : theme.colors.subtext}
                />
                <Text
                    style={[
                        styles.ruleText,
                        { color: active ? "#22c55e" : theme.colors.subtext },
                    ]}
                >
                    {label}
                </Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={[styles.container, { backgroundColor: theme.colors.bg }]}
            behavior={Platform.OS === "ios" ? "padding" : undefined}
        >
            <View style={styles.inner}>
                <Text style={[styles.title, { color: theme.colors.text }]}>
                    creează cont ✨
                </Text>
                <Text style={[styles.subtitle, { color: theme.colors.subtext }]}>
                    folosește un email valid și o parolă puternică
                </Text>

                {error && (
                    <View style={[styles.errorBox, { borderColor: theme.colors.accent }]}>
                        <Text style={[styles.errorText, { color: theme.colors.accent }]}>
                            {error}
                        </Text>
                    </View>
                )}
                {info && (
                    <View style={[styles.infoBox]}>
                        <Text style={[styles.infoText, { color: theme.colors.text }]}>
                            {info}
                        </Text>
                    </View>
                )}

                {/* EMAIL */}
                <View className="mb-3" style={styles.field}>
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

                {/* CONFIRM */}
                <View style={styles.field}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        confirmă parola
                    </Text>
                    <TextInput
                        value={confirm}
                        onChangeText={setConfirm}
                        secureTextEntry
                        placeholder="reintrodu parola"
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

                {/* REGULI PAROLĂ */}
                <View style={{ marginBottom: 14 }}>
                    <Text style={[styles.label, { color: theme.colors.text }]}>
                        parola trebuie să conțină:
                    </Text>
                    {bullet("minim 8 caractere", rules.length)}
                    {bullet("cel puțin o literă mare (A-Z)", rules.upper)}
                    {bullet("cel puțin o cifră (0-9)", rules.digit)}
                    {bullet("cel puțin un simbol (!@#$ etc.)", rules.special)}
                </View>

                <Pressable
                    onPress={onRegister}
                    style={[
                        styles.primaryBtn,
                        { backgroundColor: theme.colors.primary },
                    ]}
                    disabled={loading}
                >
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.primaryText}>creează cont</Text>
                    )}
                </Pressable>

                <View style={styles.bottomRow}>
                    <Text style={{ color: theme.colors.subtext }}>
                        ai deja un cont?
                    </Text>
                    <Pressable onPress={goLogin}>
                        <Text style={{ color: theme.colors.accent, fontWeight: "700" }}>
                            mergi la login
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
    title: { fontSize: 26, fontWeight: "800", marginBottom: 4 },
    subtitle: { fontSize: 14, marginBottom: 18 },
    field: { marginBottom: 12 },
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
    primaryBtn: {
        borderRadius: 10,
        paddingVertical: 12,
        alignItems: "center",
        marginTop: 4,
        marginBottom: 10,
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
    ruleRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
    ruleText: { fontSize: 12 },
});
