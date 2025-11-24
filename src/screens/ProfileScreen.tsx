import React from "react";
import { View, Text } from "react-native";

export default function ProfileScreen() {
    return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
            <Text style={{ fontSize: 20, fontWeight: "800" }}>Profile</Text>
            <Text style={{ marginTop: 6, color: "#666" }}>
                (placeholder pentru hackathon)
            </Text>
        </View>
    );
}
