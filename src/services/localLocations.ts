import rawLocations from "../data/locations.json";
import type { Location } from "./locationsRepo";

type RawLocation = {
    name: string;
    address: string;
    coordinates: { lat: number; long: number };
    image_url: string;
    short_description: string;
    rating: number;
};

export function getLocalLocations(): Location[] {
    return (rawLocations as RawLocation[]).map((l) => ({
        name: l.name,
        address: l.address,
        latitude: l.coordinates.lat,
        longitude: l.coordinates.long,
        image_url: l.image_url,
        short_description: l.short_description,
        rating: l.rating,
        city: l.address.split(",").slice(-1)[0]?.trim() || null,
    }));
}
