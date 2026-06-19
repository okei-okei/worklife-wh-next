export type NzLocation = {
  countryCode: "NZ";
  region: string;
  district: string;
  area: string;
  label: string;
  searchText: string;
};

const rawLocations = [
  ["Northland", "Far North District"],
  ["Northland", "Whangarei District"],
  ["Northland", "Kaipara District"],
  ["Auckland", "Auckland"],
  ["Waikato", "Hamilton City"],
  ["Waikato", "Waikato District"],
  ["Waikato", "Waipa District"],
  ["Waikato", "Thames-Coromandel District"],
  ["Waikato", "Hauraki District"],
  ["Waikato", "Matamata-Piako District"],
  ["Waikato", "South Waikato District"],
  ["Waikato", "Taupo District"],
  ["Bay of Plenty", "Tauranga City"],
  ["Bay of Plenty", "Western Bay of Plenty District"],
  ["Bay of Plenty", "Rotorua Lakes District"],
  ["Bay of Plenty", "Whakatane District"],
  ["Bay of Plenty", "Kawerau District"],
  ["Bay of Plenty", "Opotiki District"],
  ["Gisborne", "Gisborne District"],
  ["Hawke's Bay", "Napier City"],
  ["Hawke's Bay", "Hastings District"],
  ["Hawke's Bay", "Central Hawke's Bay District"],
  ["Hawke's Bay", "Wairoa District"],
  ["Taranaki", "New Plymouth District"],
  ["Taranaki", "Stratford District"],
  ["Taranaki", "South Taranaki District"],
  ["Manawatu-Whanganui", "Palmerston North City"],
  ["Manawatu-Whanganui", "Whanganui District"],
  ["Manawatu-Whanganui", "Manawatu District"],
  ["Manawatu-Whanganui", "Horowhenua District"],
  ["Manawatu-Whanganui", "Rangitikei District"],
  ["Manawatu-Whanganui", "Ruapehu District"],
  ["Manawatu-Whanganui", "Tararua District"],
  ["Wellington", "Wellington City"],
  ["Wellington", "Lower Hutt City"],
  ["Wellington", "Upper Hutt City"],
  ["Wellington", "Porirua City"],
  ["Wellington", "Kapiti Coast District"],
  ["Wellington", "Masterton District"],
  ["Wellington", "South Wairarapa District"],
  ["Tasman", "Tasman District"],
  ["Nelson", "Nelson City"],
  ["Marlborough", "Marlborough District"],
  ["West Coast", "Buller District"],
  ["West Coast", "Grey District"],
  ["West Coast", "Westland District"],
  ["Canterbury", "Christchurch City"],
  ["Canterbury", "Selwyn District"],
  ["Canterbury", "Waimakariri District"],
  ["Canterbury", "Ashburton District"],
  ["Canterbury", "Timaru District"],
  ["Canterbury", "Mackenzie District"],
  ["Canterbury", "Waimate District"],
  ["Canterbury", "Hurunui District"],
  ["Canterbury", "Kaikoura District"],
  ["Otago", "Dunedin City"],
  ["Otago", "Queenstown-Lakes District"],
  ["Otago", "Central Otago District"],
  ["Otago", "Waitaki District"],
  ["Otago", "Clutha District"],
  ["Southland", "Invercargill City"],
  ["Southland", "Southland District"],
  ["Southland", "Gore District"],
  ["Chatham Islands", "Chatham Islands Territory"],
] as const;

const areasByDistrict: Record<string, string[]> = {
  Auckland: [
    "Auckland CBD",
    "North Shore",
    "West Auckland",
    "East Auckland",
    "South Auckland",
  ],
  "Hamilton City": ["Hamilton Central", "Frankton", "Claudelands", "Rototuna"],
  "Tauranga City": ["Tauranga Central", "Mount Maunganui", "Papamoa"],
  "Rotorua Lakes District": ["Rotorua Central", "Fenton Park", "Ngongotaha"],
  "Wellington City": ["Wellington Central", "Te Aro", "Newtown", "Kilbirnie"],
  "Lower Hutt City": ["Lower Hutt Central", "Petone", "Wainuiomata"],
  "Christchurch City": [
    "Christchurch Central",
    "Riccarton",
    "Addington",
    "Hornby",
  ],
  "Dunedin City": ["Dunedin Central", "North Dunedin", "South Dunedin"],
  "Queenstown-Lakes District": ["Queenstown", "Frankton", "Wanaka"],
};

export const nzLocations: NzLocation[] = rawLocations.flatMap(
  ([region, district]) => {
    const areas = areasByDistrict[district] || [""];

    return areas.map((area) => ({
      countryCode: "NZ" as const,
      region,
      district,
      area,
      label: area
        ? `${region} / ${district} / ${area}`
        : `${region} / ${district}`,
      searchText: `${region} ${district} ${area}`.toLowerCase(),
    }));
  },
);

export function filterNzLocations(query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return nzLocations;
  }

  return nzLocations.filter((location) =>
    location.searchText.includes(normalizedQuery),
  );
}
