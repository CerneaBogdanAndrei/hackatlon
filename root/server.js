// server.js - server Node/Express cu AI local + vibe generator OpenAI

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(path.join(__dirname, "public")));

// ===== Local locations JSON =====
const locationsPath = path.join(__dirname, "src", "data", "locations.json");
const locations = JSON.parse(fs.readFileSync(locationsPath, "utf8"));

// ===== Helper functions (chat local) =====

function normalize(text) {
    return text
        .toLowerCase()
        .replaceAll("ă", "a")
        .replaceAll("â", "a")
        .replaceAll("î", "i")
        .replaceAll("ș", "s")
        .replaceAll("ş", "s")
        .replaceAll("ț", "t")
        .replaceAll("ţ", "t");
}

function extractCity(address) {
    const parts = address.split(",");
    return parts[parts.length - 1].trim();
}

function detectCity(message) {
    const m = normalize(message);

    const cities = {
        bucuresti: ["bucuresti", "bucharest"],
        cluj: ["cluj", "cluj-napoca"],
        timisoara: ["timisoara", "timișoara"],
        iasi: ["iasi", "iași"],
        brasov: ["brasov", "brașov"],
        sibiu: ["sibiu"],
        constanta: ["constanta", "constanța", "mare", "litoral"],
        oradea: ["oradea"],
        galati: ["galati", "galați"],
        craiova: ["craiova"],
        ploiesti: ["ploiești", "ploiesti"],
        alba: ["alba iulia", "alba-iulia"],
        tgMures: ["targu mures", "târgu mureș", "targu-mures"],
    };

    for (const [key, variants] of Object.entries(cities)) {
        if (variants.some((v) => m.includes(v))) return key;
    }
    return null;
}

function detectTags(message) {
    const m = normalize(message);
    const tags = [];

    if (m.includes("cafea") || m.includes("cafenea") || m.includes("coffee")) {
        tags.push("coffee");
    }
    if (m.includes("vegan")) tags.push("vegan");
    if (m.includes("pizza") || m.includes("pizzerie")) tags.push("pizza");
    if (m.includes("burger")) tags.push("burger");
    if (m.includes("peste") || m.includes("fish") || m.includes("seafood")) {
        tags.push("fish");
    }
    if (m.includes("romantic") || m.includes("date") || m.includes("întâlnire") || m.includes("intalnire")) {
        tags.push("romantic");
    }
    if (m.includes("student") || m.includes("facultate") || m.includes("campus")) {
        tags.push("students");
    }
    if (m.includes("ieftin") || m.includes("buget") || m.includes("low cost")) {
        tags.push("cheap");
    }

    return tags;
}

function findMatchingLocations(message) {
    const cityKey = detectCity(message);
    const tags = detectTags(message);

    let filtered = locations.slice();

    if (cityKey) {
        filtered = filtered.filter((loc) => {
            const addr = normalize(loc.address);
            switch (cityKey) {
                case "bucuresti": return addr.includes("bucharest") || addr.includes("bucuresti");
                case "cluj": return addr.includes("cluj");
                case "timisoara": return addr.includes("timisoara");
                case "iasi": return addr.includes("iasi");
                case "brasov": return addr.includes("brasov");
                case "sibiu": return addr.includes("sibiu");
                case "constanta": return addr.includes("constanta") || normalize(loc.name).includes("sea");
                case "oradea": return addr.includes("oradea");
                case "galati": return addr.includes("galati");
                case "craiova": return addr.includes("craiova");
                case "ploiesti": return addr.includes("ploiesti");
                case "alba": return addr.includes("alba iulia");
                case "tgMures": return addr.includes("targu mures");
                default: return true;
            }
        });
    }

    if (tags.length > 0) {
        filtered = filtered.filter((loc) => {
            const name = normalize(loc.name);
            const desc = normalize(loc.short_description || "");

            return tags.every((tag) => {
                switch (tag) {
                    case "coffee":
                        return name.includes("coffee") || name.includes("cafe") || desc.includes("espresso") || desc.includes("brunch");
                    case "vegan":
                        return name.includes("vegan") || desc.includes("plant-based");
                    case "pizza":
                        return name.includes("pizza") || name.includes("pizzeria");
                    case "burger":
                        return name.includes("burger");
                    case "fish":
                        return name.includes("pesc") || name.includes("sea") || desc.includes("seafood") || desc.includes("peste");
                    case "romantic":
                        return desc.includes("romantic") || desc.includes("terasa") || desc.includes("linistit");
                    case "students":
                        return desc.includes("student") || desc.includes("campus") || desc.includes("lunch");
                    case "cheap":
                        return desc.includes("ieftin") || desc.includes("menu fix") || desc.includes("meniul zilei");
                    default:
                        return true;
                }
            });
        });
    }

    if (filtered.length === 0 && cityKey) {
        filtered = locations.filter((loc) =>
            normalize(loc.address).includes(cityKey === "cluj" ? "cluj" : cityKey)
        );
    }

    filtered.sort((a, b) => b.rating - a.rating);
    return filtered.slice(0, 3);
}

function buildLongDescription(loc, message) {
    const city = extractCity(loc.address);
    const msg = normalize(message);

    const introTemplates = [
        (l) => `"${l.name}" este unul dintre cele mai apreciate locuri din ${city}, aflat la adresa ${l.address}.`,
        (l) => `Dacă ajungi prin ${city}, merită neapărat să încerci "${l.name}", situat pe ${l.address}.`,
        (l) => `"${l.name}", pe ${l.address} (${city}), este o opțiune foarte populară printre localnici și studenți.`,
    ];

    const atmosphereTemplates = [
        (l) =>
            l.rating >= 4.7
                ? `Atmosfera e caldă și prietenoasă, iar recenziile îl plasează constant peste ${l.rating.toFixed(1)} din 5 stele.`
                : `E un loc echilibrat, cu recenzii bune și un rating general de ${l.rating.toFixed(1)} din 5.`,
        (l) =>
            `Mulți clienți spun că se simt relaxați aici, iar ratingul de ${l.rating.toFixed(1)} confirmă asta.`,
    ];

    const baseDesc = loc.short_description || "";

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const usageTemplates = [];

    if (msg.includes("student")) {
        usageTemplates.push(
            "E potrivit pentru studenți: prânz rapid între cursuri sau o seară relaxată cu colegii."
        );
    } else if (msg.includes("romantic") || msg.includes("intalnire")) {
        usageTemplates.push(
            "Ambianța îl recomandă pentru întâlniri romantice: lumină discretă și vibe liniștit."
        );
    } else if (msg.includes("cafea")) {
        usageTemplates.push(
            "Dacă îți place cafeaua bună, aici găsești espresso corect făcut și băuturi de specialitate."
        );
    } else {
        usageTemplates.push(
            "E un loc bun atât pentru prieteni cât și pentru familie, într-un cadru plăcut."
        );
    }

    const extraTemplates = [
        "Personalul e apreciat ca fiind prietenos și prompt.",
        "Poate fi aglomerat la orele de vârf, deci e bine să ajungi mai devreme.",
        "Decorul și platingul sunt foarte potrivite pentru poze faine.",
    ];

    const paragraphs = [];
    paragraphs.push(pickRandom(introTemplates)(loc));
    if (baseDesc) paragraphs.push(baseDesc);
    paragraphs.push(pickRandom(atmosphereTemplates)(loc));
    paragraphs.push(usageTemplates[0]);
    paragraphs.push(pickRandom(extraTemplates));

    return paragraphs.join(" ");
}

// ===== Endpoint “chat” local =====
app.post("/api/chat", (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.json({
            reply:
                "Scrie ce fel de loc cauți. Ex: „cafenea liniștită în Cluj” sau „local cu pește la mare”.",
        });
    }

    const matches = findMatchingLocations(message);

    if (matches.length === 0) {
        return res.json({
            reply:
                "Nu am găsit ceva potrivit. Încearcă să menționezi orașul sau tipul de local.",
        });
    }

    let reply = "";

    if (matches.length === 1) {
        reply += buildLongDescription(matches[0], message);
    } else {
        reply += "Am găsit câteva variante potrivite:\n\n";
        matches.forEach((loc, idx) => {
            reply += `${idx + 1}. ${buildLongDescription(loc, message)}\n\n`;
        });
    }

    res.json({ reply });
});

// ===== Endpoint AI generativ pentru vibe =====
app.post("/api/vibe", async (req, res) => {
    try {
        const { location } = req.body;

        if (!location?.name) {
            return res.status(400).json({ error: "location missing" });
        }

        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            return res.status(500).json({ error: "OPENAI_API_KEY not set" });
        }

        const prompt =
            `Rescrie creativ descrierea pentru această locație, într-un stil “vibe / instagram / prietenos”. ` +
            `Scrie în română, 2-4 propoziții, fără emoji excesive. ` +
            `Nume: ${location.name}. ` +
            `Adresă: ${location.address}. ` +
            `Rating: ${location.rating ?? "N/A"}. ` +
            `Descriere scurtă originală: ${location.short_description ?? "N/A"}.`;

        const r = await fetch("https://api.openai.com/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "gpt-4o-mini",
                messages: [
                    { role: "system", content: "Ești un copywriter creativ pentru localuri." },
                    { role: "user", content: prompt },
                ],
                temperature: 0.8,
                max_tokens: 180,
            }),
        });

        if (!r.ok) {
            const text = await r.text();
            return res.status(500).json({ error: text });
        }

        const json = await r.json();
        const vibe = json.choices?.[0]?.message?.content?.trim();

        return res.json({ vibe });
    } catch (e) {
        console.log("vibe error:", e);
        return res.status(500).json({ error: "vibe failed" });
    }
});

// ===== Pornim serverul =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server pornit pe http://localhost:${PORT}`);
});
