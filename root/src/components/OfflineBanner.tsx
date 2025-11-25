import { useEffect, useState } from "react";
import { View, Text, StyleSheet } from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { useTheme } from "../theme/useTheme";

export default function OfflineBanner() {
    const [offline, setOffline] = useState(false);
    const theme = useTheme();

    useEffect(() => {
        const sub = NetInfo.addEventListener((state) => {
            const isOff = !(state.isConnected && state.isInternetReachable !== false);
            setOffline(isOff);
        });
        return () => sub();
    }, []);

    if (!offline) return null;

    return (
        <View style={[styles.container, { backgroundColor: "#b91c1c" }]}>
            <Text style={styles.text}>
                ești offline — folosim datele locale; unele funcții (AI, sync) pot fi limitate
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 10,
        paddingVertical: 6,
    },
    text: {
        color: "#fee2e2",
        fontSize: 11,
        textAlign: "center",
    },
});
