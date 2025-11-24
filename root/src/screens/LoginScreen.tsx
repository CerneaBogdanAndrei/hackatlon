import { useState } from "react";
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

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    async function login() {
        if (!email || !password) {
            Alert.alert("missing data", "introdu email și parolă.");
            return;
        }

        try {
            setLoading(true);

            const { error } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (error) {
                Alert.alert("login error", error.message);
                return;
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 28, fontWeight: "800" }}>welcome 👋</Text>
            <Text style={{ opacity: 0.7 }}>login cu email și parolă.</Text>

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

            {/* Password input + eye */}
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
                    style={{
                        flex: 1,
                        padding: 12,
                    }}
                />
                <Pressable onPress={() => setShowPassword((v) => !v)}>
                    <Ionicons
                        name={showPassword ? "eye-off" : "eye"}
                        size={22}
                        color="#666"
                    />
                </Pressable>
            </View>

            <Pressable
                onPress={login}
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
                    <Text style={{ color: "white", fontWeight: "700" }}>login</Text>
                )}
            </Pressable>

            <Pressable onPress={() => navigation.navigate("register")}>
                <Text style={{ textAlign: "center" }}>nu ai cont? register</Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate("forgot")}>
                <Text style={{ textAlign: "center", opacity: 0.7 }}>
                    ai uitat parola?
                </Text>
            </Pressable>
        </View>
    );
}
