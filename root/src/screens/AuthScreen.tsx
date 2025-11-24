import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export default function AuthScreen() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    async function signInWithEmail() {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signInWithOtp({ email });
            if (error) throw error;

            Alert.alert("check your email", "ți-am trimis un link/otp de login.");
        } catch (e: any) {
            Alert.alert("login error", e.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 26, fontWeight: "700" }}>welcome 👋</Text>
            <Text style={{ opacity: 0.7 }}>loghează-te ca să salvezi favorite.</Text>

            <TextInput
                placeholder="email@exemplu.com"
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

            <Pressable
                onPress={signInWithEmail}
                disabled={loading || !email}
                style={{
                    backgroundColor: "#111",
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    opacity: loading || !email ? 0.6 : 1,
                }}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={{ color: "white", fontWeight: "600" }}>send magic link</Text>
                )}
            </Pressable>
        </View>
    );
}


//pentru commit

