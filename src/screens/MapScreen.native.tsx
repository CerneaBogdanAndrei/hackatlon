import { useEffect, useState } from "react";
import { View, ActivityIndicator } from "react-native";
import MapView, { Marker } from "react-native-maps";
import rawLocations from "../data/locations.json";
import { supabase } from "../lib/supabase";

type RawLocation = {
    name: string;
    address: string;
    coordinates: { lat: number; long: number };
    image_url: string;
    short_description: string;
    rating: number;
};

type Location = {
    id?: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    rating: number;
};

function getLocalLocations(): Location[] {
    return (rawLocations as RawLocation[]).map((l) => ({
        name: l.name,
        address: l.address,
        latitude: l.coordinates.lat,
        longitude: l.coordinates.long,
        rating: l.rating,
    }));
}

export default function MapScreen() {
    const [locations, setLocations] = useState<Location[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                const { data } = await supabase.from("locations").select("*");
                setLocations((data as Location[]) ?? getLocalLocations());
            } catch {
                setLocations(getLocalLocations());
            }
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
