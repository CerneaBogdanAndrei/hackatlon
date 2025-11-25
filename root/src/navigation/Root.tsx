import { useEffect, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AppTabs from "./AppTabs";
import DetailsScreen from "../screens/DetailsScreen";
import AuthStack from "./AuthStack";
import { supabase } from "../lib/supabase";
import { useTheme } from "../theme/useTheme";

export type RootStackParamList = {
    auth: undefined;
    tabs: undefined;
    details: { location: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function Root() {
    const theme = useTheme();
    const [initializing, setInitializing] = useState(true);
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    // verificăm user-ul curent la pornire
    useEffect(() => {
        let mounted = true;

        async function checkUser() {
            try {
                const { data } = await supabase.auth.getUser();
                if (!mounted) return;
                setIsLoggedIn(!!data.user);
            } catch {
                if (!mounted) return;
                setIsLoggedIn(false);
            } finally {
                if (!mounted) return;
                setInitializing(false);
            }
        }

        checkUser();

        // ascultăm schimbările de sesiune (login / logout)
        const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
            setIsLoggedIn(!!session?.user);
        });

        return () => {
            mounted = false;
            sub.subscription.unsubscribe();
        };
    }, []);

    // ecran de "loading" cât timp verificăm sesiunea
    if (initializing || isLoggedIn === null) {
        return (
            <View
                style={[
                    styles.center,
                    { backgroundColor: theme.colors.bg },
                ]}
            >
                <ActivityIndicator size="large" color={theme.colors.text} />
                <Text style={{ marginTop: 8, color: theme.colors.text }}>
                    se încarcă aplicația...
                </Text>
            </View>
        );
    }

    return (
        <Stack.Navigator>
            {isLoggedIn ? (
                <>
                    {/* app-ul principal */}
                    <Stack.Screen
                        name="tabs"
                        component={AppTabs}
                        options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="details"
                        component={DetailsScreen}
                        options={{ title: "details" }}
                    />
                </>
            ) : (
                // stack-ul de autentificare
                <Stack.Screen
                    name="auth"
                    component={AuthStack}
                    options={{ headerShown: false }}
                />
            )}
        </Stack.Navigator>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
});
