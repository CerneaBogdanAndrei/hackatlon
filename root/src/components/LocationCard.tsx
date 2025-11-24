import React from "react";
import { View, Text, Image, Pressable, StyleSheet } from "react-native";
import type { Location } from "../services/localLocations";

export default function LocationCard({
                                         item,
                                         onPress,
                                     }: {
    item: Location;
    onPress: () => void;
}) {
    return (
        <Pressable onPress={onPress} style={styles.card}>
            <Image source={{ uri: item.image_url }} style={styles.img} />
            <View style={styles.body}>
                <Text style={styles.title}>{item.name}</Text>
                <Text style={styles.addr}>{item.address}</Text>
                <Text style={styles.rating}>⭐ {item.rating}</Text>
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    card: {
        backgroundColor: "#111",
        borderRadius: 16,
        marginHorizontal: 12,
        marginVertical: 8,
        overflow: "hidden",
    },
    img: { height: 170, width: "100%" },
    body: { padding: 12 },
    title: { color: "white", fontSize: 18, fontWeight: "800" },
    addr: { color: "#bbb", marginTop: 4 },
    rating: { color: "white", marginTop: 6, fontWeight: "700" },
});
