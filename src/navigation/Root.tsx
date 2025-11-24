import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import AuthScreen from "../screens/AuthScreen";
import Tabs from "./Tabs";

export default function Root() {
    const [session, setSession] = useState<any>(null);

    useEffect(() => {
        supabase.auth.getSession().then(({ data }) => setSession(data.session));

        const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => listener.subscription.unsubscribe();
    }, []);

    return session ? <Tabs /> : <AuthScreen />;
}
