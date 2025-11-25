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

function makeFallbackId(l: any, idx: number) {
    // id stabil din name+address dacă nu vine din DB
    const base = `${l.name ?? "loc"}|${l.address ?? "addr"}|${idx}`;
    let hash = 0;
    for (let i = 0; i < base.length; i++) {
        hash = (hash * 31 + base.charCodeAt(i)) | 0;
    }
    return Math.abs(hash);
}

export async function getLocations(): Promise<Location[]> {
    if (FORCE_LOCAL) return localLocations;

    try {
        const { data, error } = await supabase
            .from("locations")
            .select("*")
            .order("rating", { ascending: false });

        if (error || !data || data.length === 0) {
            return localLocations;
        }

        const mapped: Location[] = data.map((l: any, idx: number) => {
            const numericId = Number(l.id);

            return {
                id: Number.isFinite(numericId) ? numericId : makeFallbackId(l, idx), // ✅ unic
                name: l.name,
                address: l.address,
                latitude: l.latitude,
                longitude: l.longitude,
                image_url: l.image_url ?? null,
                short_description: l.short_description ?? null,
                rating: l.rating ?? null,
            };
        });

        // ✅ dacă Supabase dă id-uri duplicate, le reparăm:
        const seen = new Set<number>();
        const fixed = mapped.map((l, idx) => {
            if (!seen.has(l.id)) {
                seen.add(l.id);
                return l;
            }
            const newId = makeFallbackId(l, idx);
            seen.add(newId);
            return { ...l, id: newId };
        });

        return fixed;
    } catch (e) {
        console.log("[locationsRepo] fallback local", e);
        return localLocations;
    }
}
