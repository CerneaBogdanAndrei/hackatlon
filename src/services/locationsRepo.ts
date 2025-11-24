import { supabase } from "../lib/supabase";
import { getLocalLocations } from "./localLocations";

export type Location = {
    id?: string;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    image_url?: string | null;
    short_description?: string | null;
    rating: number;
    city?: string | null;
};

export async function fetchLocationsHybrid(): Promise<{
    source: "supabase" | "local";
    locations: Location[];
}> {
    try {
        const { data, error } = await supabase
            .from("locations")
            .select("*")
            .order("rating", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            return { source: "supabase", locations: data as Location[] };
        }

        return { source: "local", locations: getLocalLocations() };
    } catch {
        return { source: "local", locations: getLocalLocations() };
    }
}
