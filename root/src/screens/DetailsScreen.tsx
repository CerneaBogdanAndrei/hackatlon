import { View, Text, Image, ScrollView, StyleSheet } from "react-native";

export default function DetailsScreen({ route }: any) {
    const { location } = route.params;

    return (
        <ScrollView contentContainerStyle={{ padding: 12 }}>
            {!!location.image_url && (
                <Image source={{ uri: location.image_url }} style={styles.img} />
            )}

            <Text style={styles.title}>{location.name}</Text>
            <Text style={styles.addr}>{location.address}</Text>

            {!!location.short_description && (
                <Text style={styles.desc}>{location.short_description}</Text>
            )}

            {location.rating != null && (
                <Text style={styles.rating}>⭐ {location.rating}</Text>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    img: {
        width: "100%",
        height: 220,
        borderRadius: 14,
        backgroundColor: "#eee",
        marginBottom: 12,
    },
    title: { fontSize: 22, fontWeight: "800" },
    addr: { marginTop: 4, opacity: 0.7 },
    desc: { marginTop: 10, fontSize: 16, lineHeight: 22 },
    rating: { marginTop: 10, fontWeight: "800" },
});
