import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import { fetchLocationsHybrid, Location } from "../services/locationsRepo";

export default function MapScreen() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await fetchLocationsHybrid();
            setLocations(res.locations);
            setLoading(false);
        })();
    }, []);

    const first = locations[0];

    if (loading || !first) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    return (
        <MapView
            style={{ flex: 1 }}
            initialRegion={{
                latitude: first.latitude,
                longitude: first.longitude,
                latitudeDelta: 0.2,
                longitudeDelta: 0.2,
            }}
        >
            {locations.map((l) => (
                <Marker
                    key={l.id ?? l.name}
                    coordinate={{ latitude: l.latitude, longitude: l.longitude }}
                    title={l.name}
                    description={l.address}
                />
            ))}
        </MapView>
    );
}
