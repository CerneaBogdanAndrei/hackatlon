const form = document.getElementById("chat-form");
const input = document.getElementById("message-input");
const messagesDiv = document.getElementById("messages");
const submitButton = form.querySelector("button");

function addMessage(sender, text) {
    const div = document.createElement("div");
    div.classList.add("message", sender === "user" ? "user" : "ai");
    div.textContent = text;
    messagesDiv.appendChild(div);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

async function sendMessage(message) {
    addMessage("user", message);
    input.value = "";
    submitButton.disabled = true;

    try {
        const response = await fetch("/api/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message }),
        });

        const data = await response.json();

        if (data.reply) {
            addMessage("ai", data.reply);
        } else {
            addMessage("ai", "A aparut o eroare la server.");
        }
    } catch (error) {
        console.error(error);
        addMessage("ai", "Nu am putut contacta serverul.");
    } finally {
        submitButton.disabled = false;
        input.focus();
    }
}

form.addEventListener("submit", (e) => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    sendMessage(text);
});

addMessage(
    "ai",
    "Salut! Sunt asistentul tau pentru locatii.\n" +
    "Imi poti cere, de exemplu:\n" +
    "- O cafenea linistita in Bucuresti pentru invatat\n" +
    "- Un loc ieftin pentru studenti in Cluj\n" +
    "- Un restaurant cu peste la mare\n" +
    "- Un loc fain pentru o intalnire romantica in Brasov"
);
