import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

// ținem în storage locațiile favorite, nu doar id-uri
export type FavLocation = {
    id: number;
    name: string;
    address: string;
    latitude?: number;
    longitude?: number;
    image_url?: string | null;
    short_description?: string | null;
    rating?: number | null;
};

const STORAGE_KEY = "favorite_locations_v3";

async function readFavs(): Promise<FavLocation[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return [];

        const arr = JSON.parse(raw);
        if (!Array.isArray(arr)) return [];

        return arr
            .map((x) => ({
                ...x,
                id: Number(x.id),
            }))
            .filter((x) => Number.isFinite(x.id));
    } catch {
        return [];
    }
}

async function writeFavs(favs: FavLocation[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(favs));
}

// folosit în Map/Explore ca să coloreze inimioarele
export async function getLikedIds(): Promise<number[]> {
    const favs = await readFavs();
    return favs.map((f) => f.id);
}

export async function getFavorites(): Promise<FavLocation[]> {
    return await readFavs();
}

export async function isLiked(id: number): Promise<boolean> {
    const favs = await readFavs();
    return favs.some((f) => f.id === id);
}

// toggle: dacă există -> șterge, dacă nu -> adaugă obiectul complet
export async function toggleLike(loc: FavLocation): Promise<boolean> {
    const favs = await readFavs();
    const exists = favs.some((f) => f.id === loc.id);

    let next: FavLocation[];
    let liked: boolean;

    if (exists) {
        next = favs.filter((f) => f.id !== loc.id);
        liked = false;
    } else {
        const safeLoc: FavLocation = {
            id: Number(loc.id),
            name: loc.name,
            address: loc.address,
            latitude: loc.latitude,
            longitude: loc.longitude,
            image_url: loc.image_url ?? null,
            short_description: loc.short_description ?? null,
            rating: loc.rating ?? null,
        };
        next = [safeLoc, ...favs];
        liked = true;
    }

    await writeFavs(next);

    // opțional sync supabase dacă user e logat (nu afectează local)
    try {
        const { data } = await supabase.auth.getUser();
        const user = data?.user;
        if (user) {
            if (liked) {
                await supabase.from("likes").upsert({
                    user_id: user.id,
                    location_id: loc.id,
                });
            } else {
                await supabase
                    .from("likes")
                    .delete()
                    .eq("user_id", user.id)
                    .eq("location_id", loc.id);
            }
        }
    } catch {}

    return liked;
}
