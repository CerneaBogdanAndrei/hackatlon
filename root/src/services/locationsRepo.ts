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

// dacă vrei să forțezi local mereu (temporar), pune true:
const FORCE_LOCAL = false;

export async function getLocations(): Promise<Location[]> {
    // 1) dacă forțăm local, returnăm direct din JSON
    if (FORCE_LOCAL) {
        console.log("[locationsRepo] FORCE_LOCAL = true => using local JSON");
        return localLocations;
    }

    // 2) încercăm Supabase
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
            console.log("[locationsRepo] supabase empty => fallback to local JSON");
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
        console.log("[locationsRepo] supabase crashed => fallback to local JSON", e);
        return localLocations;
    }
}
