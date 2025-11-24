export async function sendLocalChat(message: string): Promise<string> {
    const baseUrl =
        process.env.EXPO_PUBLIC_LOCAL_API_URL ||
        "http://10.0.2.2:3000"; // fallback pentru emulator Android

    const res = await fetch(`${baseUrl}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message }),
    });

    if (!res.ok) {
        throw new Error("Local AI server error");
    }

    const data = await res.json();
    return data.reply as string;
}
