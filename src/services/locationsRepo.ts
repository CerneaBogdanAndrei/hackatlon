import { supabase } from "../lib/supabase";
import { getLocalLocations, Location } from "./localLocations";

export async function fetchLocationsHybrid(): Promise<{
    locations: Location[];
    source: "supabase" | "local";
}> {
    try {
        const { data, error } = await supabase
            .from("locations")
            .select("*")
            .order("rating", { ascending: false });

        if (error) throw error;

        if (data && data.length > 0) {
            return { locations: data as Location[], source: "supabase" };
        }

        return { locations: getLocalLocations(), source: "local" };
    } catch {
        return { locations: getLocalLocations(), source: "local" };
    }
}
