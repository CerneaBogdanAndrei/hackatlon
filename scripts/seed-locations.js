require("dotenv").config();
const { createClient } = require("@supabase/supabase-js");
const locations = require("../root/src/data/locations.json");

const supabase = createClient(
  process.env.supabase_url,
  process.env.supabase_service_role_key
);

async function seed() {
  const rows = locations.map((l) => ({
    name: l.name,
    address: l.address,
    latitude: l.coordinates.lat,
    longitude: l.coordinates.long,
    image_url: l.image_url,
    short_description: l.short_description,
    rating: l.rating,
    city: l.address.split(",").slice(-1)[0]?.trim() || null,
  }));

  const { error } = await supabase
    .from("locations")
    .upsert(rows, { onConflict: "name,address" });

  if (error) {
    console.error("seed error:", error.message);
    process.exit(1);
  }

  console.log("seed ok:", rows.length, "locations inserted/updated");
}

seed();
