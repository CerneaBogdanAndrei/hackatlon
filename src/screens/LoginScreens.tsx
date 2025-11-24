import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export default function LoginScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    async function login() {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) {
                Alert.alert("login error", error.message);
                return;
            }
            Alert.alert("check your email", "ți-am trimis link/otp.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 28, fontWeight: "800" }}>welcome 👋</Text>
            <Text style={{ opacity: 0.7 }}>login ca să salvezi favorite.</Text>

            <TextInput
                placeholder="email@exemplu.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={{ borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 10 }}
            />

            <Pressable
                onPress={login}
                disabled={loading || !email}
                style={{
                    backgroundColor: "#111",
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    opacity: loading || !email ? 0.6 : 1,
                }}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: "white" }}>login</Text>}
            </Pressable>

            <Pressable onPress={() => navigation.navigate("register")}>
                <Text style={{ textAlign: "center" }}>nu ai cont? register</Text>
            </Pressable>

            <Pressable onPress={() => navigation.navigate("forgot")}>
                <Text style={{ textAlign: "center", opacity: 0.7 }}>ai uitat parola?</Text>
            </Pressable>
        </View>
    );
}
