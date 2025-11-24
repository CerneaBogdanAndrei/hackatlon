import { createClient } from "@supabase/supabase-js";

const url =
    process.env.EXPO_PUBLIC_SUPABASE_URL ||
    "https://kznyalpmsliqczjvjsyd.supabase.co";

const key =
    process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    "sb_publishable_e68KFKseR8eAoSLmhVhDPw_39tEdFIC";

export const supabase = createClient(url, key);
