type Coordinate = {
  latitude: number;
  longitude: number;
};

type LocationLike = {
  address?: string | null;
  region?: string | null;
  district?: string | null;
  city?: string | null;
  suburb?: string | null;
  area?: string | null;
  country_code?: string | null;
};

const nzFallbackCenter: Coordinate = {
  latitude: -40.9006,
  longitude: 174.886,
};

const locationCoordinates: Record<string, Coordinate> = {
  "northland": { latitude: -35.7251, longitude: 174.3237 },
  "far north district": { latitude: -35.1167, longitude: 173.2676 },
  "whangarei district": { latitude: -35.7251, longitude: 174.3237 },
  "kaipara district": { latitude: -36.0896, longitude: 173.9502 },

  "auckland": { latitude: -36.8485, longitude: 174.7633 },
  "auckland cbd": { latitude: -36.8485, longitude: 174.7633 },
  "north shore": { latitude: -36.7833, longitude: 174.75 },
  "west auckland": { latitude: -36.8743, longitude: 174.629 },
  "east auckland": { latitude: -36.8897, longitude: 174.9135 },
  "south auckland": { latitude: -36.9784, longitude: 174.8795 },

  "waikato": { latitude: -37.787, longitude: 175.2793 },
  "hamilton city": { latitude: -37.787, longitude: 175.2793 },
  "hamilton central": { latitude: -37.787, longitude: 175.2793 },
  "frankton": { latitude: -37.7866, longitude: 175.2572 },
  "claudelands": { latitude: -37.7752, longitude: 175.2928 },
  "rototuna": { latitude: -37.7237, longitude: 175.2806 },
  "waikato district": { latitude: -37.5434, longitude: 175.1592 },
  "waipa district": { latitude: -37.982, longitude: 175.3258 },
  "thames-coromandel district": { latitude: -37.1384, longitude: 175.541 },
  "hauraki district": { latitude: -37.3713, longitude: 175.6747 },
  "matamata-piako district": { latitude: -37.8104, longitude: 175.7764 },
  "south waikato district": { latitude: -38.2183, longitude: 175.8705 },
  "taupo district": { latitude: -38.6857, longitude: 176.0702 },

  "bay of plenty": { latitude: -37.6878, longitude: 176.1651 },
  "tauranga city": { latitude: -37.6878, longitude: 176.1651 },
  "tauranga central": { latitude: -37.6878, longitude: 176.1651 },
  "mount maunganui": { latitude: -37.6412, longitude: 176.1863 },
  "papamoa": { latitude: -37.7067, longitude: 176.2905 },
  "western bay of plenty district": { latitude: -37.7418, longitude: 175.9231 },
  "rotorua lakes district": { latitude: -38.1368, longitude: 176.2497 },
  "rotorua central": { latitude: -38.1368, longitude: 176.2497 },
  "fenton park": { latitude: -38.1564, longitude: 176.2522 },
  "ngongotaha": { latitude: -38.0817, longitude: 176.2113 },
  "whakatane district": { latitude: -37.9534, longitude: 176.9908 },
  "kawerau district": { latitude: -38.1007, longitude: 176.7008 },
  "opotiki district": { latitude: -38.0083, longitude: 177.2871 },

  "gisborne": { latitude: -38.6623, longitude: 178.0176 },
  "gisborne district": { latitude: -38.6623, longitude: 178.0176 },

  "hawke's bay": { latitude: -39.4928, longitude: 176.912 },
  "napier city": { latitude: -39.4928, longitude: 176.912 },
  "hastings district": { latitude: -39.6381, longitude: 176.8492 },
  "central hawke's bay district": { latitude: -39.9333, longitude: 176.5883 },
  "wairoa district": { latitude: -39.0333, longitude: 177.3667 },

  "taranaki": { latitude: -39.0556, longitude: 174.0752 },
  "new plymouth district": { latitude: -39.0556, longitude: 174.0752 },
  "stratford district": { latitude: -39.3378, longitude: 174.2841 },
  "south taranaki district": { latitude: -39.5917, longitude: 174.2833 },

  "manawatu-whanganui": { latitude: -40.3523, longitude: 175.6082 },
  "palmerston north city": { latitude: -40.3523, longitude: 175.6082 },
  "whanganui district": { latitude: -39.9301, longitude: 175.0479 },
  "manawatu district": { latitude: -40.225, longitude: 175.565 },
  "horowhenua district": { latitude: -40.6227, longitude: 175.2864 },
  "rangitikei district": { latitude: -40.0694, longitude: 175.378 },
  "ruapehu district": { latitude: -39.417, longitude: 175.399 },
  "tararua district": { latitude: -40.2087, longitude: 176.1003 },

  "wellington": { latitude: -41.2865, longitude: 174.7762 },
  "wellington city": { latitude: -41.2865, longitude: 174.7762 },
  "wellington central": { latitude: -41.2865, longitude: 174.7762 },
  "te aro": { latitude: -41.295, longitude: 174.7752 },
  "newtown": { latitude: -41.3132, longitude: 174.7798 },
  "kilbirnie": { latitude: -41.3181, longitude: 174.7956 },
  "lower hutt city": { latitude: -41.2124, longitude: 174.9081 },
  "lower hutt central": { latitude: -41.2124, longitude: 174.9081 },
  "petone": { latitude: -41.2283, longitude: 174.8703 },
  "wainuiomata": { latitude: -41.2611, longitude: 174.9483 },
  "upper hutt city": { latitude: -41.1243, longitude: 175.07 },
  "porirua city": { latitude: -41.1332, longitude: 174.8403 },
  "kapiti coast district": { latitude: -40.9167, longitude: 175.0167 },
  "masterton district": { latitude: -40.9597, longitude: 175.6575 },
  "south wairarapa district": { latitude: -41.219, longitude: 175.458 },

  "tasman": { latitude: -41.2706, longitude: 173.284 },
  "tasman district": { latitude: -41.2706, longitude: 173.284 },
  "nelson": { latitude: -41.2706, longitude: 173.284 },
  "nelson city": { latitude: -41.2706, longitude: 173.284 },
  "marlborough": { latitude: -41.5134, longitude: 173.9612 },
  "marlborough district": { latitude: -41.5134, longitude: 173.9612 },

  "west coast": { latitude: -42.4504, longitude: 171.2108 },
  "buller district": { latitude: -41.752, longitude: 171.602 },
  "grey district": { latitude: -42.4504, longitude: 171.2108 },
  "westland district": { latitude: -42.7174, longitude: 170.968 },

  "canterbury": { latitude: -43.5321, longitude: 172.6362 },
  "christchurch city": { latitude: -43.5321, longitude: 172.6362 },
  "christchurch central": { latitude: -43.5321, longitude: 172.6362 },
  "riccarton": { latitude: -43.5294, longitude: 172.598 },
  "addington": { latitude: -43.5435, longitude: 172.608 },
  "hornby": { latitude: -43.5446, longitude: 172.525 },
  "selwyn district": { latitude: -43.7542, longitude: 172.0771 },
  "waimakariri district": { latitude: -43.3038, longitude: 172.5957 },
  "ashburton district": { latitude: -43.9039, longitude: 171.7501 },
  "timaru district": { latitude: -44.3967, longitude: 171.2536 },
  "mackenzie district": { latitude: -44.0047, longitude: 170.4773 },
  "waimate district": { latitude: -44.7321, longitude: 171.0479 },
  "hurunui district": { latitude: -42.734, longitude: 172.832 },
  "kaikoura district": { latitude: -42.4008, longitude: 173.6814 },

  "otago": { latitude: -45.8788, longitude: 170.5028 },
  "dunedin city": { latitude: -45.8788, longitude: 170.5028 },
  "dunedin central": { latitude: -45.8788, longitude: 170.5028 },
  "north dunedin": { latitude: -45.8654, longitude: 170.5146 },
  "south dunedin": { latitude: -45.8972, longitude: 170.5028 },
  "queenstown-lakes district": { latitude: -45.0312, longitude: 168.6626 },
  "queenstown": { latitude: -45.0312, longitude: 168.6626 },
  "wanaka": { latitude: -44.7032, longitude: 169.1321 },
  "central otago district": { latitude: -45.249, longitude: 169.379 },
  "waitaki district": { latitude: -45.0976, longitude: 170.9709 },
  "clutha district": { latitude: -46.2395, longitude: 169.74 },

  "southland": { latitude: -46.4132, longitude: 168.3538 },
  "invercargill city": { latitude: -46.4132, longitude: 168.3538 },
  "southland district": { latitude: -45.9991, longitude: 168.1943 },
  "gore district": { latitude: -46.1028, longitude: 168.9436 },
  "chatham islands": { latitude: -43.9535, longitude: -176.5597 },
  "chatham islands territory": { latitude: -43.9535, longitude: -176.5597 },
};

function normalize(value: string | null | undefined) {
  return value?.trim().toLowerCase() || "";
}

function lookupByText(text: string) {
  const normalizedText = normalize(text);
  if (!normalizedText) return null;

  if (locationCoordinates[normalizedText]) {
    return locationCoordinates[normalizedText];
  }

  const match = Object.entries(locationCoordinates).find(([key]) =>
    normalizedText.includes(key),
  );

  return match?.[1] ?? null;
}

export function resolveNzApproximateCoordinates(
  listing: LocationLike,
): Coordinate | null {
  const countryCode = normalize(listing.country_code);
  if (countryCode && countryCode !== "nz") return null;

  const directFields = [
    listing.area,
    listing.suburb,
    listing.district,
    listing.city,
    listing.region,
    listing.address,
  ];

  for (const field of directFields) {
    const match = lookupByText(field || "");
    if (match) return match;
  }

  const combined = directFields.filter(Boolean).join(" ");
  return lookupByText(combined) || nzFallbackCenter;
}

export function resolveNzAddressApproximateCoordinates({
  address,
  country_code,
}: Pick<LocationLike, "address" | "country_code">): Coordinate | null {
  const countryCode = normalize(country_code);
  if (countryCode && countryCode !== "nz") return null;

  if (!address?.trim()) return null;

  return lookupByText(address);
}
