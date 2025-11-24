// index.js - server Node/Express cu "AI local" peste locations.json
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "public"))); // servește frontend-ul din /public

// Citim baza de date locală cu locații
const locationsPath = path.join(__dirname, "src", "data", "locations.json");
const locations = JSON.parse(fs.readFileSync(locationsPath, "utf8"));

// ===== Helper functions =====

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
        ploiesti: ["ploiesti", "ploiești"],
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
    if (
        m.includes("romantic") ||
        m.includes("intalnire") ||
        m.includes("întâlnire") ||
        m.includes("date")
    ) {
        tags.push("romantic");
    }
    if (m.includes("student") || m.includes("studenti") || m.includes("facultate")) {
        tags.push("students");
    }
    if (m.includes("ieftin") || m.includes("low cost") || m.includes("buget")) {
        tags.push("cheap");
    }

    return tags;
}

function findMatchingLocations(message) {
    const cityKey = detectCity(message);
    const tags = detectTags(message);

    let filtered = locations.slice();

    // 1. Filtrare după oraș
    if (cityKey) {
        filtered = filtered.filter((loc) => {
            const addr = normalize(loc.address);
            switch (cityKey) {
                case "bucuresti":
                    return addr.includes("bucharest") || addr.includes("bucuresti");
                case "cluj":
                    return addr.includes("cluj");
                case "timisoara":
                    return addr.includes("timisoara");
                case "iasi":
                    return addr.includes("iasi");
                case "brasov":
                    return addr.includes("brasov");
                case "sibiu":
                    return addr.includes("sibiu");
                case "constanta":
                    return addr.includes("constanta") || normalize(loc.name).includes("sea");
                case "oradea":
                    return addr.includes("oradea");
                case "galati":
                    return addr.includes("galati");
                case "craiova":
                    return addr.includes("craiova");
                case "ploiesti":
                    return addr.includes("ploiesti");
                case "alba":
                    return addr.includes("alba iulia");
                case "tgMures":
                    return addr.includes("targu mures");
                default:
                    return true;
            }
        });
    }

    // 2. Filtrare după taguri
    if (tags.length > 0) {
        filtered = filtered.filter((loc) => {
            const name = normalize(loc.name);
            const desc = normalize(loc.short_description);

            return tags.every((tag) => {
                switch (tag) {
                    case "coffee":
                        return (
                            name.includes("coffee") ||
                            name.includes("cafe") ||
                            desc.includes("espresso") ||
                            desc.includes("cafea") ||
                            desc.includes("brunch")
                        );
                    case "vegan":
                        return name.includes("vegan") || desc.includes("plant-based");
                    case "pizza":
                        return name.includes("pizza") || name.includes("pizzeria");
                    case "burger":
                        return name.includes("burger");
                    case "fish":
                        return (
                            name.includes("pesc") ||
                            name.includes("sea") ||
                            desc.includes("peste") ||
                            desc.includes("seafood")
                        );
                    case "romantic":
                        return (
                            desc.includes("romantic") ||
                            desc.includes("terasa") ||
                            desc.includes("linistit") ||
                            desc.includes("liniștit")
                        );
                    case "students":
                        return (
                            desc.includes("student") ||
                            desc.includes("campus") ||
                            desc.includes("meniu de pranz") ||
                            desc.includes("lunch")
                        );
                    case "cheap":
                        return (
                            desc.includes("ieftin") ||
                            desc.includes("cheap") ||
                            desc.includes("menu fix") ||
                            desc.includes("meniul zilei")
                        );
                    default:
                        return true;
                }
            });
        });
    }

    // 3. Fallback dacă nu a rămas nimic dar știm orașul
    if (filtered.length === 0 && cityKey) {
        filtered = locations.filter((loc) =>
            normalize(loc.address).includes(cityKey === "cluj" ? "cluj" : cityKey)
        );
    }

    // sortăm după rating descrescător și luăm max 3
    filtered.sort((a, b) => b.rating - a.rating);
    return filtered.slice(0, 3);
}

function buildLongDescription(loc, message) {
    const city = extractCity(loc.address);
    const msg = normalize(message);

    const introTemplates = [
        (l) =>
            `„${l.name}” este unul dintre cele mai apreciate locuri din ${city}, aflat la adresa ${l.address}.`,
        (l) =>
            `Daca ajungi prin ${city}, merita neaparat sa incerci „${l.name}”, situat pe ${l.address}.`,
        (l) =>
            `„${l.name}”, pe ${l.address} (${city}), este o optiune foarte populara printre localnici si studenti.`,
    ];

    const atmosphereTemplates = [
        (l) =>
            l.rating >= 4.7
                ? `Atmosfera este calda si prietenoasa, iar recenziile il plaseaza constant peste ${l.rating.toFixed(
                    1
                )} din 5 stele.`
                : `Este un loc echilibrat, cu recenzii bune si un rating general de aproximativ ${l.rating.toFixed(
                    1
                )} din 5.`,
        (l) =>
            `Multi clienti mentioneaza ca se simt foarte relaxati aici, iar ratingul de ${l.rating.toFixed(
                1
            )} din 5 confirma experienta placuta.`,
    ];

    const usageTemplates = [];

    if (msg.includes("student")) {
        usageTemplates.push(
            "Este potrivit in special pentru studenti, fie ca vii pentru un pranz rapid intre cursuri, fie pentru o seara mai relaxata cu colegii."
        );
    } else if (msg.includes("romantic") || msg.includes("intalnire")) {
        usageTemplates.push(
            "Ambianta il recomanda pentru intalniri romantice: lumina discreta, muzica placuta si posibilitatea de a sta la povesti in liniste."
        );
    } else if (msg.includes("cafea") || msg.includes("cappuccino")) {
        usageTemplates.push(
            "Daca iti place cafeaua buna, aici gasesti espresso corect facut, dar si optiuni precum cappuccino sau latte pentru un moment de relaxare."
        );
    } else if (msg.includes("vegan")) {
        usageTemplates.push(
            "Este o alegere foarte buna pentru cei care prefera optiuni vegane sau mancare mai usoara, bazata pe ingrediente proaspete."
        );
    } else {
        usageTemplates.push(
            "Este genul de loc unde poti veni atat cu prietenii, cat si cu familia, pentru a manca bine si a petrece timp intr-un cadru placut."
        );
    }

    const extraTemplates = [
        "Personalul este in general apreciat ca fiind prietenos si prompt, ceea ce contribuie mult la experienta generala.",
        "In functie de ora si de zi, poate fi destul de aglomerat, asa ca merita sa iei in calcul o rezervare sau sa ajungi ceva mai devreme.",
        "Daca iti place sa faci poze pentru Instagram, decorul si platingul mancarurilor se preteaza foarte bine pentru asta.",
    ];

    const baseDesc = loc.short_description;

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const paragraphs = [];
    paragraphs.push(pickRandom(introTemplates)(loc));
    paragraphs.push(baseDesc);
    paragraphs.push(pickRandom(atmosphereTemplates)(loc));
    paragraphs.push(usageTemplates[0]);
    paragraphs.push(pickRandom(extraTemplates));

    return paragraphs.join(" ");
}

// ===== Endpointul de “chat” local =====

app.post("/api/chat", (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.json({
            reply:
                "Poti sa-mi scrii ce fel de loc cauti. De exemplu: „O cafenea linistita in Cluj pentru invatat” sau „Un local cu peste la mare”.",
        });
    }

    const matches = findMatchingLocations(message);

    if (matches.length === 0) {
        return res.json({
            reply:
                "Nu am reusit sa gasesc un loc potrivit in lista mea pentru ce ai descris. Incearca sa mentionezi si orasul sau tipul de local (cafenea, pizza, vegan, peste, etc.).",
        });
    }

    let reply = "";

    if (matches.length === 1) {
        reply += buildLongDescription(matches[0], message);
    } else {
        reply +=
            "Am gasit mai multe variante care s-ar potrivi cu ce ai intrebat. Iata cateva recomandari:\n\n";
        matches.forEach((loc, idx) => {
            reply += `${idx + 1}. ${buildLongDescription(loc, message)}\n\n`;
        });
    }

    res.json({ reply });
});

// ===== Pornim serverul =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server local (fara OpenAI) pornit pe http://localhost:${PORT}`);
});
