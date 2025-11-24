import { supabase } from "../lib/supabase";

export async function fetchFavoriteIds(): Promise<string[]> {
    try {
        const user = (await supabase.auth.getUser()).data.user;
        if (!user) return [];

        const { data, error } = await supabase
            .from("favorites")
            .select("location_id")
            .eq("user_id", user.id);

        if (error) throw error;

        return (data ?? []).map((x) => x.location_id as string);
    } catch {
        return [];
    }
}

export async function addFavorite(locationId: string) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase.from("favorites").insert({
        user_id: user.id,
        location_id: locationId,
    });

    if (error) throw error;
}

export async function removeFavorite(locationId: string) {
    const user = (await supabase.auth.getUser()).data.user;
    if (!user) return;

    const { error } = await supabase
        .from("favorites")
        .delete()
        .eq("user_id", user.id)
        .eq("location_id", locationId);

    if (error) throw error;
}
