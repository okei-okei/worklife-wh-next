export type NzLocation = {
  id: string;
  key?: string;
  databaseId?: string | null;
  linzId: string | null;
  countryCode: "NZ";
  region: string;
  district: string;
  cityDistrict?: string;
  area: string;
  locality?: string;
  territorialAuthority: string | null;
  majorName: string | null;
  suburbLocality: string;
  aliases?: string[];
  additionalNames: string[];
  latitude: number | null;
  longitude: number | null;
  label: string;
  searchText: string;
  isActive: boolean;
};

type SeedLocation = {
  region: string;
  cityDistrict: string;
  locality: string;
  territorialAuthority?: string;
  majorName?: string;
  aliases?: string[];
  latitude?: number;
  longitude?: number;
};

const aucklandCentral = [
  "Auckland CBD",
  "City Centre",
  "Parnell",
  "Newmarket",
  "Grafton",
  "Eden Terrace",
  "Mount Eden",
  "Epsom",
  "Grey Lynn",
  "Ponsonby",
  "Freemans Bay",
  "Kingsland",
  "Sandringham",
  "Mount Albert",
  "Point Chevalier",
  "Avondale",
];

const northShore = [
  "Devonport",
  "Belmont",
  "Takapuna",
  "Milford",
  "Forrest Hill",
  "Sunnynook",
  "Castor Bay",
  "Campbells Bay",
  "Mairangi Bay",
  "Murrays Bay",
  "Rothesay Bay",
  "Browns Bay",
  "Torbay",
  "Long Bay",
  "Albany",
  "Rosedale",
  "Greenhithe",
  "Glenfield",
  "Birkenhead",
  "Northcote",
  "Beach Haven",
  "Birkdale",
];

const westAuckland = [
  "Henderson",
  "Te Atatu Peninsula",
  "Te Atatu South",
  "Massey",
  "Westgate",
  "Hobsonville",
  "Whenuapai",
  "Ranui",
  "Swanson",
  "Glen Eden",
  "Titirangi",
  "Kelston",
  "Green Bay",
  "New Lynn",
];

const eastAuckland = [
  "Howick",
  "Pakuranga",
  "Highland Park",
  "Half Moon Bay",
  "Bucklands Beach",
  "Botany Downs",
  "East Tamaki",
  "Flat Bush",
  "Dannemora",
  "Beachlands",
  "Maraetai",
];

const southAuckland = [
  "Onehunga",
  "Mangere",
  "Mangere Bridge",
  "Otahuhu",
  "Papatoetoe",
  "Manukau",
  "Wiri",
  "Manurewa",
  "Takanini",
  "Papakura",
  "Pukekohe",
];

const christchurch = [
  "Christchurch Central City",
  "Addington",
  "Riccarton",
  "Upper Riccarton",
  "Ilam",
  "Avonhead",
  "Burnside",
  "Bishopdale",
  "Papanui",
  "Merivale",
  "St Albans",
  "Fendalton",
  "Spreydon",
  "Sydenham",
  "Somerfield",
  "Cashmere",
  "Halswell",
  "Wigram",
  "Hornby",
  "Sockburn",
  "Hei Hei",
  "Islington",
  "Russley",
  "Yaldhurst",
  "Linwood",
  "Phillipstown",
  "Woolston",
  "Ferrymead",
  "Sumner",
  "New Brighton",
  "Burwood",
  "Shirley",
  "Redwood",
  "Belfast",
  "Northwood",
  "Parklands",
];

const byCityDistrict = (
  region: string,
  cityDistrict: string,
  localities: string[],
  options: Pick<SeedLocation, "territorialAuthority" | "majorName"> = {},
) =>
  localities.map((locality): SeedLocation => ({
    region,
    cityDistrict,
    locality,
    territorialAuthority: options.territorialAuthority || cityDistrict,
    majorName: options.majorName,
  }));

const seedLocations: SeedLocation[] = [
  ...byCityDistrict("Northland", "Far North District", ["Kaitaia"]),
  ...byCityDistrict("Northland", "Whangarei District", ["Whangarei"]),
  ...byCityDistrict("Northland", "Kaipara District", ["Dargaville"]),
  ...byCityDistrict("Auckland", "Auckland Central", aucklandCentral, {
    territorialAuthority: "Auckland",
    majorName: "Auckland Central",
  }),
  ...byCityDistrict("Auckland", "North Shore", northShore, {
    territorialAuthority: "Auckland",
    majorName: "North Shore",
  }),
  ...byCityDistrict("Auckland", "West Auckland", westAuckland, {
    territorialAuthority: "Auckland",
    majorName: "West Auckland",
  }),
  ...byCityDistrict("Auckland", "East Auckland", eastAuckland, {
    territorialAuthority: "Auckland",
    majorName: "East Auckland",
  }),
  ...byCityDistrict("Auckland", "South Auckland", southAuckland, {
    territorialAuthority: "Auckland",
    majorName: "South Auckland",
  }),
  ...byCityDistrict("Waikato", "Hamilton", [
    "Hamilton Central",
    "Frankton",
    "Claudelands",
    "Rototuna",
  ], { territorialAuthority: "Hamilton City" }),
  ...byCityDistrict("Waikato", "Waikato District", ["Huntly"]),
  ...byCityDistrict("Waikato", "Waipa District", ["Cambridge"]),
  ...byCityDistrict("Waikato", "Thames-Coromandel District", ["Whitianga"]),
  ...byCityDistrict("Waikato", "Taupo District", ["Taupo"]),
  ...byCityDistrict("Bay of Plenty", "Tauranga", [
    "Tauranga Central",
    "Mount Maunganui",
    "Papamoa",
  ], { territorialAuthority: "Tauranga City" }),
  ...byCityDistrict("Bay of Plenty", "Rotorua", ["Rotorua Central"], {
    territorialAuthority: "Rotorua Lakes District",
  }),
  ...byCityDistrict("Bay of Plenty", "Whakatane District", ["Whakatane"]),
  ...byCityDistrict("Gisborne", "Gisborne District", ["Gisborne"]),
  ...byCityDistrict("Hawke's Bay", "Napier", ["Napier"], {
    territorialAuthority: "Napier City",
  }),
  ...byCityDistrict("Hawke's Bay", "Hastings District", ["Hastings"]),
  ...byCityDistrict("Taranaki", "New Plymouth District", ["New Plymouth"]),
  ...byCityDistrict("Manawatu-Whanganui", "Palmerston North", [
    "Palmerston North",
  ], { territorialAuthority: "Palmerston North City" }),
  ...byCityDistrict("Manawatu-Whanganui", "Whanganui District", ["Whanganui"]),
  ...byCityDistrict("Wellington", "Wellington", [
    "Wellington Central",
    "Te Aro",
    "Newtown",
    "Kilbirnie",
  ], { territorialAuthority: "Wellington City" }),
  ...byCityDistrict("Wellington", "Lower Hutt", ["Petone"], {
    territorialAuthority: "Lower Hutt City",
  }),
  ...byCityDistrict("Wellington", "Upper Hutt", ["Upper Hutt"], {
    territorialAuthority: "Upper Hutt City",
  }),
  ...byCityDistrict("Wellington", "Porirua", ["Porirua"], {
    territorialAuthority: "Porirua City",
  }),
  ...byCityDistrict("Tasman", "Tasman District", ["Richmond"]),
  ...byCityDistrict("Nelson", "Nelson", ["Nelson"], {
    territorialAuthority: "Nelson City",
  }),
  ...byCityDistrict("Marlborough", "Marlborough District", ["Blenheim"]),
  ...byCityDistrict("West Coast", "Buller District", ["Westport"]),
  ...byCityDistrict("West Coast", "Grey District", ["Greymouth"]),
  ...byCityDistrict("West Coast", "Westland District", ["Hokitika"]),
  ...byCityDistrict("Canterbury", "Christchurch", christchurch, {
    territorialAuthority: "Christchurch City",
    majorName: "Christchurch",
  }),
  ...byCityDistrict("Canterbury", "Selwyn", ["Rolleston"], {
    territorialAuthority: "Selwyn District",
  }),
  ...byCityDistrict("Canterbury", "Waimakariri", ["Rangiora"], {
    territorialAuthority: "Waimakariri District",
  }),
  ...byCityDistrict("Canterbury", "Ashburton District", ["Ashburton"]),
  ...byCityDistrict("Canterbury", "Timaru District", ["Timaru"]),
  ...byCityDistrict("Otago", "Dunedin", ["Dunedin Central", "North Dunedin"], {
    territorialAuthority: "Dunedin City",
  }),
  ...byCityDistrict("Otago", "Queenstown-Lakes District", [
    "Queenstown",
    "Frankton",
    "Wanaka",
  ]),
  ...byCityDistrict("Otago", "Central Otago District", ["Cromwell"]),
  ...byCityDistrict("Southland", "Invercargill", ["Invercargill"], {
    territorialAuthority: "Invercargill City",
  }),
  ...byCityDistrict("Southland", "Southland District", ["Te Anau"]),
  ...byCityDistrict("Southland", "Gore District", ["Gore"]),
  ...byCityDistrict("Chatham Islands", "Chatham Islands Territory", ["Waitangi"]),
].map((item) => {
  if (item.locality === "Auckland CBD") {
    return {
      ...item,
      aliases: ["Central Auckland", "Auckland Central", "City Centre"],
    };
  }
  if (item.locality === "Christchurch Central City") {
    return {
      ...item,
      aliases: ["Christchurch Central", "Christchurch CBD"],
    };
  }
  if (item.locality === "Browns Bay") {
    return {
      ...item,
      aliases: ["Browns Bay Central", "East Coast Bays"],
    };
  }
  if (item.locality === "Hornby") {
    return {
      ...item,
      aliases: ["Hornby Christchurch", "Christchurch Hornby"],
    };
  }
  if (item.locality === "Ilam") {
    return {
      ...item,
      aliases: ["Ilam Christchurch", "Christchurch Ilam", "Waimairi Road Ilam"],
    };
  }
  if (item.locality === "Te Atatu Peninsula") {
    return { ...item, aliases: ["Te Atatu", "Te Atatu Peninsula"] };
  }
  if (item.locality === "East Tamaki") {
    return { ...item, aliases: ["East Tamaki", "East Tāmaki"] };
  }
  if (item.locality === "Mangere") {
    return { ...item, aliases: ["Mangere", "Māngere"] };
  }
  if (item.locality === "Otahuhu") {
    return { ...item, aliases: ["Otahuhu", "Ōtāhuhu"] };
  }
  return item;
});

function toKey(...parts: string[]) {
  return parts
    .join("-")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function uniqueLocations(locations: SeedLocation[]) {
  const seen = new Set<string>();
  return locations.filter((location) => {
    const key = toKey(location.region, location.cityDistrict, location.locality);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export const nzLocations: NzLocation[] = uniqueLocations(seedLocations).map(
  (item, index) => {
    const aliases = item.aliases || [];
    const key = toKey(item.region, item.cityDistrict, item.locality);
    const territorialAuthority = item.territorialAuthority || item.cityDistrict;
    const majorName = item.majorName || item.cityDistrict;
    const searchText = [
      item.region,
      item.cityDistrict,
      territorialAuthority,
      majorName,
      item.locality,
      ...aliases,
      "New Zealand",
      "NZ",
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    return {
      id: `nz-seed-${index + 1}`,
      key,
      databaseId: null,
      linzId: null,
      countryCode: "NZ",
      region: item.region,
      district: item.cityDistrict,
      cityDistrict: item.cityDistrict,
      area: item.locality,
      locality: item.locality,
      territorialAuthority,
      majorName,
      suburbLocality: item.locality,
      aliases,
      additionalNames: aliases,
      latitude: item.latitude ?? null,
      longitude: item.longitude ?? null,
      label: `${item.region} / ${item.cityDistrict} / ${item.locality}`,
      searchText,
      isActive: true,
    };
  },
);

export function filterNzLocations(query: string, limit = 30) {
  const normalizedQuery = normalizeLocationText(query);

  if (!normalizedQuery) {
    return nzLocations.slice(0, limit);
  }

  return nzLocations
    .map((location) => {
      const normalizedSearchText = normalizeLocationText(location.searchText);
      const normalizedArea = normalizeLocationText(location.area);
      const normalizedDistrict = normalizeLocationText(location.district);
      const normalizedRegion = normalizeLocationText(location.region);
      const normalizedAliases = (location.aliases || []).map(normalizeLocationText);
      const words = normalizedSearchText.split(/\s+/);
      let score = 0;

      if (normalizedArea === normalizedQuery) score = 100;
      else if (normalizedAliases.includes(normalizedQuery)) score = 95;
      else if (normalizedDistrict === normalizedQuery) score = 90;
      else if (normalizedRegion === normalizedQuery) score = 80;
      else if (normalizedArea.startsWith(normalizedQuery)) score = 70;
      else if (normalizedDistrict.startsWith(normalizedQuery)) score = 65;
      else if (words.includes(normalizedQuery)) score = 60;
      else if (normalizedSearchText.includes(normalizedQuery)) score = 40;

      return { location, score };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score || a.location.label.localeCompare(b.location.label))
    .map((item) => item.location)
    .slice(0, limit);
}

function normalizeLocationText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[-_/]+/g, " ")
    .replace(/\bsaint\b/g, "st")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
