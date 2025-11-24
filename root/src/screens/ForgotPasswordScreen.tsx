import { useState } from "react";
import {
    View,
    Text,
    TextInput,
    Pressable,
    ActivityIndicator,
    Alert,
} from "react-native";
import { supabase } from "../lib/supabase";

export default function ForgotPasswordScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    async function resetPassword() {
        if (!email) {
            Alert.alert("missing email", "introdu email.");
            return;
        }

        try {
            setLoading(true);
            const { error } = await supabase.auth.resetPasswordForEmail(email);

            if (error) {
                Alert.alert("reset error", error.message);
                return;
            }

            Alert.alert("sent", "ți-am trimis email de reset.");
            navigation.goBack();
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 24, fontWeight: "800" }}>forgot password</Text>

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
                onPress={resetPassword}
                disabled={loading}
                style={{
                    backgroundColor: "#111",
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    opacity: loading ? 0.6 : 1,
                }}
            >
                {loading ? (
                    <ActivityIndicator color="white" />
                ) : (
                    <Text style={{ color: "white", fontWeight: "700" }}>
                        send reset link
                    </Text>
                )}
            </Pressable>

            <Pressable onPress={() => navigation.goBack()}>
                <Text style={{ textAlign: "center" }}>înapoi</Text>
            </Pressable>
        </View>
    );
}
