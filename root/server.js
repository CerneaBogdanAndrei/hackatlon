// server.js - server Node/Express cu "AI local" peste src/data/locations.json

const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// (opțional) dacă vei avea un frontend separat în /public
app.use(express.static(path.join(__dirname, "public")));

// Citim baza de date locală cu locații (folosește src/data/locations.json din proiectul tău)
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
            const desc = normalize(loc.short_description || "");

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
            `"${l.name}" este unul dintre cele mai apreciate locuri din ${city}, aflat la adresa ${l.address}.`,
        (l) =>
            `Dacă ajungi prin ${city}, merită neapărat să încerci "${l.name}", situat pe ${l.address}.`,
        (l) =>
            `"${l.name}", pe ${l.address} (${city}), este o opțiune foarte populară printre localnici și studenți.`,
    ];

    const atmosphereTemplates = [
        (l) =>
            l.rating >= 4.7
                ? `Atmosfera este caldă și prietenoasă, iar recenziile îl plasează constant peste ${l.rating.toFixed(
                    1
                )} din 5 stele.`
                : `Este un loc echilibrat, cu recenzii bune și un rating general de aproximativ ${l.rating.toFixed(
                    1
                )} din 5.`,
        (l) =>
            `Mulți clienți menționează că se simt foarte relaxați aici, iar ratingul de ${l.rating.toFixed(
                1
            )} din 5 confirmă experiența plăcută.`,
    ];

    const usageTemplates = [];

    if (msg.includes("student")) {
        usageTemplates.push(
            "Este potrivit în special pentru studenți, fie că vii pentru un prânz rapid între cursuri, fie pentru o seară mai relaxată cu colegii."
        );
    } else if (msg.includes("romantic") || msg.includes("intalnire") || msg.includes("întâlnire")) {
        usageTemplates.push(
            "Ambianța îl recomandă pentru întâlniri romantice: lumină discretă, muzică plăcută și posibilitatea de a sta la povești în liniște."
        );
    } else if (msg.includes("cafea") || msg.includes("cappuccino")) {
        usageTemplates.push(
            "Dacă îți place cafeaua bună, aici găsești espresso corect făcut, dar și opțiuni precum cappuccino sau latte pentru un moment de relaxare."
        );
    } else if (msg.includes("vegan")) {
        usageTemplates.push(
            "Este o alegere foarte bună pentru cei care preferă opțiuni vegane sau mâncare mai ușoară, bazată pe ingrediente proaspete."
        );
    } else {
        usageTemplates.push(
            "Este genul de loc unde poți veni atât cu prietenii, cât și cu familia, pentru a mânca bine și a petrece timp într-un cadru plăcut."
        );
    }

    const extraTemplates = [
        "Personalul este apreciat ca fiind prietenos și prompt, ceea ce contribuie mult la experiența generală.",
        "În funcție de oră și de zi, poate fi destul de aglomerat, așa că merită să iei în calcul o rezervare sau să ajungi ceva mai devreme.",
        "Dacă îți place să faci poze pentru Instagram, decorul și platingul mâncărurilor se pretează foarte bine pentru asta.",
    ];

    const baseDesc = loc.short_description || "";

    function pickRandom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    const paragraphs = [];
    paragraphs.push(pickRandom(introTemplates)(loc));
    if (baseDesc) paragraphs.push(baseDesc);
    paragraphs.push(pickRandom(atmosphereTemplates)(loc));
    paragraphs.push(usageTemplates[0]);
    paragraphs.push(pickRandom(extraTemplates));

    return paragraphs.join(" ");
}

// ===== Endpointul de “chat” local =====
app.get("/", (req, res) => {
    res.send("Server local OK. Folosește POST /api/chat");
});
app.post("/api/chat", (req, res) => {
    const { message } = req.body;

    if (!message || !message.trim()) {
        return res.json({
            reply:
                "Poți să-mi scrii ce fel de loc cauți. De exemplu: „O cafenea liniștită în Cluj pentru învățat” sau „Un local cu pește la mare”.",
        });
    }

    const matches = findMatchingLocations(message);

    if (matches.length === 0) {
        return res.json({
            reply:
                "Nu am reușit să găsesc un loc potrivit în lista mea pentru ce ai descris. Încearcă să menționezi și orașul sau tipul de local (cafenea, pizza, vegan, pește etc.).",
        });
    }

    let reply = "";

    if (matches.length === 1) {
        reply += buildLongDescription(matches[0], message);
    } else {
        reply +=
            "Am găsit mai multe variante care s-ar potrivi cu ce ai întrebat. Iată câteva recomandări:\n\n";
        matches.forEach((loc, idx) => {
            reply += `${idx + 1}. ${buildLongDescription(loc, message)}\n\n`;
        });
    }

    res.json({ reply });
});

// ===== Pornim serverul =====
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server local (fara OpenAI) pornit pe http://localhost:${PORT}`);
});
