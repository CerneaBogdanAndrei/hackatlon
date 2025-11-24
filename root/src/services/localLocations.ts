import rawLocations from "../data/locations.json";
import type { Location } from "./locationsRepo";

type RawLocation = {
    name: string;
    address: string;
    coordinates: { lat: number; long: number };
    image_url?: string;
    short_description?: string;
    rating?: number;
};

export const localLocations: Location[] = (rawLocations as RawLocation[]).map(
    (l, i) => ({
        id: i + 1,
        name: l.name,
        address: l.address,
        latitude: l.coordinates.lat,
        longitude: l.coordinates.long,
        image_url: l.image_url ?? null,
        short_description: l.short_description ?? null,
        rating: l.rating ?? null,
    })
);
