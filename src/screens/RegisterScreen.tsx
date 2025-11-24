import { useState } from "react";
import { View, Text, TextInput, Pressable, ActivityIndicator, Alert } from "react-native";
import { supabase } from "../lib/supabase";

export default function RegisterScreen({ navigation }: any) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    async function register() {
        try {
            setLoading(true);
            const { error } = await supabase.auth.signUp({ email });
            if (error) {
                Alert.alert("register error", error.message);
                return;
            }
            Alert.alert("success", "cont creat. verifică email-ul.");
            navigation.navigate("login");
        } finally {
            setLoading(false);
        }
    }

    return (
        <View style={{ flex: 1, justifyContent: "center", padding: 20, gap: 12 }}>
            <Text style={{ fontSize: 26, fontWeight: "800" }}>create account</Text>

            <TextInput
                placeholder="email@exemplu.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={{ borderWidth: 1, borderColor: "#ddd", padding: 12, borderRadius: 10 }}
            />

            <Pressable
                onPress={register}
                disabled={loading || !email}
                style={{
                    backgroundColor: "#111",
                    padding: 12,
                    borderRadius: 10,
                    alignItems: "center",
                    opacity: loading || !email ? 0.6 : 1,
                }}
            >
                {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: "white" }}>register</Text>}
            </Pressable>

            <Pressable onPress={() => navigation.goBack()}>
                <Text style={{ textAlign: "center" }}>înapoi la login</Text>
            </Pressable>
        </View>
    );
}
