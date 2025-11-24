import { useMemo, useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    ActivityIndicator,
    Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { supabase } from "../lib/supabase";

function checkPassword(pw: string) {
    const minLen = pw.length >= 6;
    const hasLower = /[a-z]/.test(pw);
    const hasUpper = /[A-Z]/.test(pw);
    const hasNumber = /[0-9]/.test(pw);
    const hasSpecial = /[^A-Za-z0-9]/.test(pw);

    return {
        minLen,
        hasLower,
        hasUpper,
        hasNumber,
        hasSpecial,
        allOk: minLen && hasLower && hasUpper && hasNumber && hasSpecial,
    };
}

export default function RegisterScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [password2, setPassword2] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showPassword2, setShowPassword2] = useState(false);
    const [loading, setLoading] = useState(false);

    const rules = useMemo(() => checkPassword(password), [password]);
    const passwordsMatch = password2.length === 0 ? true : password === password2;

    async function register() {
        if (!email || !password) {
            Alert.alert("missing data", "introdu email și parolă.");
            return;
        }
        if (!rules.allOk) {
            Alert.alert("weak password", "respectă regulile de mai jos.");
            return;
        }
        if (password !== password2) {
            Alert.alert("password mismatch", "parolele nu coincid.");
            return;
        }

        try {
            setLoading(true);

            const { error } = await supabase.auth.signUp({
                email,
                password,
            });

            if (error) {
                Alert.alert("register error", error.message);
                return;
            }

            Alert.alert("success", "cont creat. verifică email-ul pentru confirmare.");
            navigation.navigate("login");
        } finally {
            setLoading(false);
        }
    }

    const RuleRow = ({ ok, text }: { ok: boolean; text: string }) => (
        <Text style={{ color: ok ? "#1db954" : "#ff6b6b", fontSize: 13 }}>
            {ok ? "✓ " : "• "} {text}
        </Text>
    );

    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 26, fontWeight: "800" }}>create account</Text>

            <TextInput
                placeholder="exemple@email.com"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    padding: 12,
                    borderRadius: 10,
                }}
            />

            {/* Password 1 input + eye */}
            <View
                style={{
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingRight: 10,
                }}
            >
                <TextInput
                    placeholder="enter your password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword}
                    value={password}
                    onChangeText={setPassword}
                    style={{ flex: 1, padding: 12 }}
                />
                <Pressable onPress={() => setShowPassword((v) => !v)}>
                    <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={22}
                        color="#666"
                    />
                </Pressable>
            </View>

            {/* Panou reguli parola */}
            <View
                style={{
                    backgroundColor: "#111",
                    padding: 10,
                    borderRadius: 10,
                    gap: 4,
                }}
            >
                <Text style={{ color: "white", fontWeight: "700", marginBottom: 4 }}>
                    password must contain:
                </Text>

                <RuleRow ok={rules.minLen} text="at least 6 characters" />
                <RuleRow ok={rules.hasLower} text="one lowercase letter (a-z)" />
                <RuleRow ok={rules.hasUpper} text="one uppercase letter (A-Z)" />
                <RuleRow ok={rules.hasNumber} text="one number (0-9)" />
                <RuleRow ok={rules.hasSpecial} text="one special character (!@#$...)" />
            </View>

            {/* Password 2 input + eye */}
            <View
                style={{
                    borderWidth: 1,
                    borderColor: passwordsMatch ? "#ddd" : "#ff6b6b",
                    borderRadius: 10,
                    flexDirection: "row",
                    alignItems: "center",
                    paddingRight: 10,
                }}
            >
                <TextInput
                    placeholder="repeat your password"
                    placeholderTextColor="#999"
                    secureTextEntry={!showPassword2}
                    value={password2}
                    onChangeText={setPassword2}
                    style={{ flex: 1, padding: 12 }}
                />
                <Pressable onPress={() => setShowPassword2((v) => !v)}>
                    <Ionicons
                        name={showPassword2 ? "eye-off" : "eye"}
                        size={22}
                        color="#666"
                    />
                </Pressable>
            </View>

            {!passwordsMatch && (
                <Text style={{ color: "#ff6b6b", fontSize: 12 }}>
                    parolele nu coincid
                </Text>
            )}

            <Pressable
                onPress={register}
                disabled={loading}
                style={{
                    backgroundColor: "#111",
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    opacity: loading ? 0.6 : 1,
                    marginTop: 4,
                }}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={{ color: "white", fontWeight: "700" }}>register</Text>
                )}
            </Pressable>

            <Pressable onPress={() => navigation.goBack()}>
                <Text style={{ textAlign: "center" }}>înapoi la login</Text>
            </Pressable>
        </View>
    );
}
