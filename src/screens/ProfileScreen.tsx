import { View, Text, Pressable } from "react-native";
import { supabase } from "../lib/supabase";

export default function ProfileScreen() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", gap: 12 }}>
            <Text>Profile</Text>
            <Pressable onPress={() => supabase.auth.signOut()}>
                <Text>Sign out</Text>
            </Pressable>
        </View>
    );
}
