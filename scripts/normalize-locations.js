const locationsRaw = require("../src/data/locations.json");

console.log("locations count:", locationsRaw.length);
console.log("first raw location:", locationsRaw[0]);

const locations = locationsRaw.map((l) => ({
    name: l.name,
    address: l.address,
    latitude: l.coordinates.lat,
    longitude: l.coordinates.long,
    image_url: l.image_url,
    short_description: l.short_description,
    rating: l.rating,
}));

console.log("first normalized location:", locations[0]);

module.exports = { locations };
