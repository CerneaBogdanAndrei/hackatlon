import { useEffect, useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ActivityIndicator,
    Pressable,
    TextInput,
    Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { supabase } from "../lib/supabase";
import { useTheme } from "../theme/useTheme";

export default function ProfileScreen() {
    const navigation = useNavigation<any>();
    const theme = useTheme();

    const [loading, setLoading] = useState(true);
    const [email, setEmail] = useState<string>("");
    const [name, setName] = useState<string>("");
    const [savingName, setSavingName] = useState(false);

    // Change password states
    const [oldPassword, setOldPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmNewPassword, setConfirmNewPassword] = useState("");
    const [savingPass, setSavingPass] = useState(false);

    useEffect(() => {
        let mounted = true;

        async function loadProfile() {
            try {
                setLoading(true);

                const {
                    data: { user },
                } = await supabase.auth.getUser();

                if (!user) {
                    if (mounted) {
                        setEmail("");
                        setName("");
                    }
                    return;
                }

                if (mounted) setEmail(user.email ?? "");

                const metaName =
                    (user.user_metadata?.full_name as string) ||
                    (user.user_metadata?.name as string) ||
                    "";

                if (mounted) setName(metaName);

                const { data: profile, error } = await supabase
                    .from("profiles")
                    .select("full_name")
                    .eq("id", user.id)
                    .single();

                if (!error && profile?.full_name && mounted) {
                    setName(profile.full_name);
                }
            } catch (e) {
                console.log("profile load error:", e);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        loadProfile();
        return () => {
            mounted = false;
        };
    }, []);

    async function saveName() {
        try {
            setSavingName(true);

            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { error } = await supabase
                .from("profiles")
                .upsert({ id: user.id, full_name: name });

            if (error) {
                Alert.alert("error", error.message);
                return;
            }
            Alert.alert("success", "name updated!");
        } catch (e: any) {
            Alert.alert("error", e.message ?? "could not save");
        } finally {
            setSavingName(false);
        }
    }

    // ✅ Schimbare parolă doar după parola veche
    async function changePassword() {
        if (!oldPassword || !newPassword || !confirmNewPassword) {
            Alert.alert("error", "completează toate câmpurile");
            return;
        }

        if (newPassword.length < 6) {
            Alert.alert("error", "parola nouă trebuie să aibă minim 6 caractere");
            return;
        }

        if (newPassword !== confirmNewPassword) {
            Alert.alert("error", "parolele noi nu coincid");
            return;
        }

        try {
            setSavingPass(true);

            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user?.email) {
                Alert.alert("error", "nu ești logat");
                return;
            }

            // 1) Re-auth cu parola veche (verificare)
            const { error: reauthError } = await supabase.auth.signInWithPassword({
                email: user.email,
                password: oldPassword,
            });

            if (reauthError) {
                Alert.alert("error", "parola veche este greșită");
                return;
            }

            // 2) Update parolă
            const { error: updateError } = await supabase.auth.updateUser({
                password: newPassword,
            });

            if (updateError) {
                Alert.alert("error", updateError.message);
                return;
            }

            Alert.alert("success", "parola a fost schimbată!");
            setOldPassword("");
            setNewPassword("");
            setConfirmNewPassword("");
        } catch (e: any) {
            Alert.alert("error", e.message ?? "nu s-a putut schimba parola");
        } finally {
            setSavingPass(false);
        }
    }

    async function logout() {
        await supabase.auth.signOut();
    }

    if (loading) {
        return (
            <View style={[styles.center, { backgroundColor: theme.colors.bg }]}>
                <ActivityIndicator size="large" />
                <Text style={{ marginTop: 8, color: theme.colors.text }}>
                    loading profile...
                </Text>
            </View>
        );
    }

    const initials = name
        ? name.trim().split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase()
        : email
            ? email[0].toUpperCase()
            : "?";

    return (
        <View style={[styles.container, { backgroundColor: theme.colors.bg }]}>
            <View
                style={[
                    styles.avatar,
                    {
                        backgroundColor: theme.colors.card,
                        borderColor: theme.colors.border,
                    },
                ]}
            >
                <Text style={{ fontSize: 26, fontWeight: "800", color: theme.colors.text }}>
                    {initials}
                </Text>
            </View>

            <Text style={[styles.title, { color: theme.colors.text }]}>profile</Text>

            {/* EMAIL */}
            <View style={[styles.box, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.label, { color: theme.colors.subtext }]}>email</Text>
                <Text style={[styles.value, { color: theme.colors.text }]}>
                    {email || "not logged in"}
                </Text>
            </View>

            {/* NAME */}
            <View style={[styles.box, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.label, { color: theme.colors.subtext }]}>name</Text>
                <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder="your name"
                    placeholderTextColor={theme.colors.subtext}
                    style={[
                        styles.input,
                        { color: theme.colors.text, borderColor: theme.colors.border },
                    ]}
                />

                <Pressable
                    onPress={saveName}
                    disabled={savingName}
                    style={[
                        styles.saveBtn,
                        {
                            backgroundColor: theme.colors.primary,
                            opacity: savingName ? 0.6 : 1,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.saveBtnText,
                            { color: theme.mode === "dark" ? "#000" : "#fff" },
                        ]}
                    >
                        {savingName ? "saving..." : "save name"}
                    </Text>
                </Pressable>
            </View>

            {/* CHANGE PASSWORD */}
            <View style={[styles.box, { backgroundColor: theme.colors.card, borderColor: theme.colors.border }]}>
                <Text style={[styles.label, { color: theme.colors.subtext }]}>
                    change password
                </Text>

                <TextInput
                    value={oldPassword}
                    onChangeText={setOldPassword}
                    placeholder="old password"
                    placeholderTextColor={theme.colors.subtext}
                    secureTextEntry
                    style={[
                        styles.input,
                        { color: theme.colors.text, borderColor: theme.colors.border, marginBottom: 8 },
                    ]}
                />

                <TextInput
                    value={newPassword}
                    onChangeText={setNewPassword}
                    placeholder="new password (min 6 chars)"
                    placeholderTextColor={theme.colors.subtext}
                    secureTextEntry
                    style={[
                        styles.input,
                        { color: theme.colors.text, borderColor: theme.colors.border, marginBottom: 8 },
                    ]}
                />

                <TextInput
                    value={confirmNewPassword}
                    onChangeText={setConfirmNewPassword}
                    placeholder="confirm new password"
                    placeholderTextColor={theme.colors.subtext}
                    secureTextEntry
                    style={[
                        styles.input,
                        { color: theme.colors.text, borderColor: theme.colors.border },
                    ]}
                />

                <Pressable
                    onPress={changePassword}
                    disabled={savingPass}
                    style={[
                        styles.saveBtn,
                        {
                            backgroundColor: theme.colors.primary,
                            opacity: savingPass ? 0.6 : 1,
                            marginTop: 10,
                        },
                    ]}
                >
                    <Text
                        style={[
                            styles.saveBtnText,
                            { color: theme.mode === "dark" ? "#000" : "#fff" },
                        ]}
                    >
                        {savingPass ? "changing..." : "change password"}
                    </Text>
                </Pressable>
            </View>

            {/* LOGOUT */}
            <Pressable
                onPress={logout}
                style={[styles.logoutBtn, { borderColor: theme.colors.border }]}
            >
                <Text style={[styles.logoutText, { color: theme.colors.text }]}>
                    logout
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    center: { flex: 1, justifyContent: "center", alignItems: "center" },
    container: { flex: 1, padding: 16 },
    avatar: {
        width: 90,
        height: 90,
        borderRadius: 45,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 1,
        alignSelf: "center",
        marginTop: 8,
    },
    title: {
        fontSize: 22,
        fontWeight: "800",
        textAlign: "center",
        marginTop: 10,
        marginBottom: 14,
    },
    box: {
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        marginBottom: 12,
    },
    label: { fontSize: 12, fontWeight: "700", marginBottom: 6 },
    value: { fontSize: 16, fontWeight: "700" },
    input: {
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 8,
        fontSize: 15,
    },
    saveBtn: {
        paddingVertical: 10,
        borderRadius: 8,
        alignItems: "center",
    },
    saveBtnText: { fontWeight: "800" },
    logoutBtn: {
        marginTop: 8,
        paddingVertical: 12,
        borderRadius: 10,
        borderWidth: 1,
        alignItems: "center",
    },
    logoutText: { fontWeight: "800", fontSize: 15 },
});
