// FĂRĂ OpenAI, doar local "AI-like"
app.post("/api/generate-vibe", (req, res) => {
    const { name, short_description, address } = req.body || {};

    const base = short_description || "Un loc fain pentru ieșit cu prietenii.";

    const templates = [
        (b) =>
            `${b} Atmosfera e relaxată, cu un vibe prietenos, perfect dacă vrei să stai la povești mai mult timp.`,
        (b) =>
            `${b} E genul de loc unde poți veni după cursuri sau după muncă, când ai nevoie de un reset rapid.`,
        (b) =>
            `${b} Se potrivește atât pentru o întâlnire lejeră, cât și pentru seri mai gălăgioase cu gașca.`,
    ];

    const extra = templates[Math.floor(Math.random() * templates.length)];

    const full = `${name ? `"${name}" – ` : ""}${base} ${extra(base)} Adresa: ${
        address || "necunoscută"
    }.`;

    res.json({ vibeDescription: full });
});
