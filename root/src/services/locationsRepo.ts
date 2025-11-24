import { supabase } from "../lib/supabase";
import { localLocations } from "./localLocations";

export type Location = {
    id: number;
    name: string;
    address: string;
    latitude: number;
    longitude: number;
    image_url?: string | null;
    short_description?: string | null;
    rating?: number | null;
};

const FORCE_LOCAL = false;

export async function getLocations(): Promise<Location[]> {
    if (FORCE_LOCAL) {
        console.log("[locationsRepo] FORCE_LOCAL -> using local JSON");
        return localLocations;
    }

    try {
        const { data, error } = await supabase
            .from("locations")
            .select("*")
            .order("rating", { ascending: false });

        if (error) {
            console.log("[locationsRepo] supabase error:", error.message);
            console.log("[locationsRepo] fallback to local JSON");
            return localLocations;
        }

        if (!data || data.length === 0) {
            console.log("[locationsRepo] supabase empty -> fallback to local JSON");
            return localLocations;
        }

        const mapped: Location[] = data.map((l: any) => ({
            id: l.id,
            name: l.name,
            address: l.address,
            latitude: l.latitude,
            longitude: l.longitude,
            image_url: l.image_url ?? null,
            short_description: l.short_description ?? null,
            rating: l.rating ?? null,
        }));

        console.log("[locationsRepo] using supabase, count =", mapped.length);
        return mapped;
    } catch (e) {
        console.log("[locationsRepo] supabase crashed -> fallback local", e);
        return localLocations;
    }
}
