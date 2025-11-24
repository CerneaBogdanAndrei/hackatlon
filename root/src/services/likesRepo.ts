import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../lib/supabase";

const STORAGE_KEY = "liked_location_ids";

async function readIds(): Promise<number[]> {
    try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!raw) return [];
        const arr = JSON.parse(raw);
        if (Array.isArray(arr)) return arr.filter((x) => typeof x === "number");
        return [];
    } catch {
        return [];
    }
}

async function writeIds(ids: number[]) {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
}

export async function getLikedIds(): Promise<number[]> {
    return await readIds();
}

export async function isLiked(id: number): Promise<boolean> {
    const ids = await readIds();
    return ids.includes(id);
}

export async function toggleLike(loc: { id: number }): Promise<boolean> {
    const ids = new Set(await readIds());

    let liked = false;
    if (ids.has(loc.id)) {
        ids.delete(loc.id);
        liked = false;
    } else {
        ids.add(loc.id);
        liked = true;
    }

    const next = [...ids];
    await writeIds(next);

    // opțional sync supabase dacă user e logat
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
    } catch {
        // ignorăm dacă nu e gata supabase
    }

    return liked;
}
