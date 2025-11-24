import React from "react";
import { View, Pressable, Text, StyleSheet } from "react-native";

export default function ToggleSegment({
                                          value,
                                          onChange,
                                      }: {
    value: "map" | "list";
    onChange: (v: "map" | "list") => void;
}) {
    return (
        <View style={styles.wrap}>
            <Pressable
                style={[styles.btn, value === "map" && styles.active]}
                onPress={() => onChange("map")}
            >
                <Text style={[styles.text, value === "map" && styles.activeText]}>
                    Map
                </Text>
            </Pressable>

            <Pressable
                style={[styles.btn, value === "list" && styles.active]}
                onPress={() => onChange("list")}
            >
                <Text style={[styles.text, value === "list" && styles.activeText]}>
                    List
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    wrap: {
        flexDirection: "row",
        backgroundColor: "#eee",
        borderRadius: 12,
        margin: 12,
        overflow: "hidden",
    },
    btn: { flex: 1, padding: 10, alignItems: "center" },
    active: { backgroundColor: "#111" },
    text: { fontWeight: "700", color: "#111" },
    activeText: { color: "white" },
});
