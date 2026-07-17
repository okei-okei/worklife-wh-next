export type NzLocation = {
  id: string;
  linzId: string | null;
  countryCode: "NZ";
  region: string;
  district: string;
  area: string;
  territorialAuthority: string | null;
  majorName: string | null;
  suburbLocality: string;
  additionalNames: string[];
  latitude: number | null;
  longitude: number | null;
  label: string;
  searchText: string;
  isActive: boolean;
};

type SeedLocation = {
  region: string;
  territorialAuthority: string;
  majorName?: string;
  suburbLocality?: string;
  additionalNames?: string[];
  latitude?: number;
  longitude?: number;
};

const seedLocations: SeedLocation[] = [
  { region: "Northland", territorialAuthority: "Far North District", suburbLocality: "Kaitaia" },
  { region: "Northland", territorialAuthority: "Whangarei District", suburbLocality: "Whangarei" },
  { region: "Northland", territorialAuthority: "Kaipara District", suburbLocality: "Dargaville" },
  { region: "Auckland", territorialAuthority: "Auckland", suburbLocality: "Auckland CBD", additionalNames: ["Central Auckland"] },
  { region: "Auckland", territorialAuthority: "Auckland", suburbLocality: "Albany" },
  { region: "Auckland", territorialAuthority: "Auckland", suburbLocality: "Takapuna" },
  { region: "Auckland", territorialAuthority: "Auckland", suburbLocality: "Newmarket" },
  { region: "Auckland", territorialAuthority: "Auckland", suburbLocality: "Mount Eden" },
  { region: "Auckland", territorialAuthority: "Auckland", suburbLocality: "Henderson", majorName: "West Auckland" },
  { region: "Auckland", territorialAuthority: "Auckland", suburbLocality: "Manukau", majorName: "South Auckland" },
  { region: "Auckland", territorialAuthority: "Auckland", suburbLocality: "Papakura" },
  { region: "Waikato", territorialAuthority: "Hamilton City", suburbLocality: "Hamilton Central" },
  { region: "Waikato", territorialAuthority: "Hamilton City", suburbLocality: "Frankton" },
  { region: "Waikato", territorialAuthority: "Hamilton City", suburbLocality: "Claudelands" },
  { region: "Waikato", territorialAuthority: "Hamilton City", suburbLocality: "Rototuna" },
  { region: "Waikato", territorialAuthority: "Waikato District", suburbLocality: "Huntly" },
  { region: "Waikato", territorialAuthority: "Waipa District", suburbLocality: "Cambridge" },
  { region: "Waikato", territorialAuthority: "Thames-Coromandel District", suburbLocality: "Whitianga" },
  { region: "Waikato", territorialAuthority: "Taupo District", suburbLocality: "Taupo" },
  { region: "Bay of Plenty", territorialAuthority: "Tauranga City", suburbLocality: "Tauranga Central" },
  { region: "Bay of Plenty", territorialAuthority: "Tauranga City", suburbLocality: "Mount Maunganui" },
  { region: "Bay of Plenty", territorialAuthority: "Tauranga City", suburbLocality: "Papamoa" },
  { region: "Bay of Plenty", territorialAuthority: "Rotorua Lakes District", suburbLocality: "Rotorua Central" },
  { region: "Bay of Plenty", territorialAuthority: "Whakatane District", suburbLocality: "Whakatane" },
  { region: "Gisborne", territorialAuthority: "Gisborne District", suburbLocality: "Gisborne" },
  { region: "Hawke's Bay", territorialAuthority: "Napier City", suburbLocality: "Napier" },
  { region: "Hawke's Bay", territorialAuthority: "Hastings District", suburbLocality: "Hastings" },
  { region: "Taranaki", territorialAuthority: "New Plymouth District", suburbLocality: "New Plymouth" },
  { region: "Manawatu-Whanganui", territorialAuthority: "Palmerston North City", suburbLocality: "Palmerston North" },
  { region: "Manawatu-Whanganui", territorialAuthority: "Whanganui District", suburbLocality: "Whanganui" },
  { region: "Wellington", territorialAuthority: "Wellington City", suburbLocality: "Wellington Central" },
  { region: "Wellington", territorialAuthority: "Wellington City", suburbLocality: "Te Aro" },
  { region: "Wellington", territorialAuthority: "Wellington City", suburbLocality: "Newtown" },
  { region: "Wellington", territorialAuthority: "Wellington City", suburbLocality: "Kilbirnie" },
  { region: "Wellington", territorialAuthority: "Lower Hutt City", suburbLocality: "Petone" },
  { region: "Wellington", territorialAuthority: "Upper Hutt City", suburbLocality: "Upper Hutt" },
  { region: "Wellington", territorialAuthority: "Porirua City", suburbLocality: "Porirua" },
  { region: "Tasman", territorialAuthority: "Tasman District", suburbLocality: "Richmond" },
  { region: "Nelson", territorialAuthority: "Nelson City", suburbLocality: "Nelson" },
  { region: "Marlborough", territorialAuthority: "Marlborough District", suburbLocality: "Blenheim" },
  { region: "West Coast", territorialAuthority: "Buller District", suburbLocality: "Westport" },
  { region: "West Coast", territorialAuthority: "Grey District", suburbLocality: "Greymouth" },
  { region: "West Coast", territorialAuthority: "Westland District", suburbLocality: "Hokitika" },
  { region: "Canterbury", territorialAuthority: "Christchurch City", majorName: "Christchurch", suburbLocality: "Christchurch Central" },
  { region: "Canterbury", territorialAuthority: "Christchurch City", majorName: "Christchurch", suburbLocality: "Riccarton" },
  { region: "Canterbury", territorialAuthority: "Christchurch City", majorName: "Christchurch", suburbLocality: "Addington" },
  { region: "Canterbury", territorialAuthority: "Christchurch City", majorName: "Christchurch", suburbLocality: "Hornby", additionalNames: ["Hornby Christchurch", "Christchurch Hornby"] },
  { region: "Canterbury", territorialAuthority: "Christchurch City", majorName: "Christchurch", suburbLocality: "Ilam", additionalNames: ["Ilam Christchurch", "Christchurch Ilam", "Waimairi Road Ilam"] },
  { region: "Canterbury", territorialAuthority: "Christchurch City", majorName: "Christchurch", suburbLocality: "Papanui" },
  { region: "Canterbury", territorialAuthority: "Christchurch City", majorName: "Christchurch", suburbLocality: "Sydenham" },
  { region: "Canterbury", territorialAuthority: "Selwyn District", suburbLocality: "Rolleston" },
  { region: "Canterbury", territorialAuthority: "Waimakariri District", suburbLocality: "Rangiora" },
  { region: "Canterbury", territorialAuthority: "Ashburton District", suburbLocality: "Ashburton" },
  { region: "Canterbury", territorialAuthority: "Timaru District", suburbLocality: "Timaru" },
  { region: "Otago", territorialAuthority: "Dunedin City", suburbLocality: "Dunedin Central" },
  { region: "Otago", territorialAuthority: "Dunedin City", suburbLocality: "North Dunedin" },
  { region: "Otago", territorialAuthority: "Queenstown-Lakes District", suburbLocality: "Queenstown" },
  { region: "Otago", territorialAuthority: "Queenstown-Lakes District", suburbLocality: "Frankton" },
  { region: "Otago", territorialAuthority: "Queenstown-Lakes District", suburbLocality: "Wanaka" },
  { region: "Otago", territorialAuthority: "Central Otago District", suburbLocality: "Cromwell" },
  { region: "Southland", territorialAuthority: "Invercargill City", suburbLocality: "Invercargill" },
  { region: "Southland", territorialAuthority: "Southland District", suburbLocality: "Te Anau" },
  { region: "Southland", territorialAuthority: "Gore District", suburbLocality: "Gore" },
  { region: "Chatham Islands", territorialAuthority: "Chatham Islands Territory", suburbLocality: "Waitangi" },
];

export const nzLocations: NzLocation[] = seedLocations.map((item, index) => {
  const suburbLocality = item.suburbLocality || item.territorialAuthority;
  const majorName = item.majorName || null;
  const additionalNames = item.additionalNames || [];
  const searchText = [
    item.region,
    item.territorialAuthority,
    majorName,
    suburbLocality,
    ...additionalNames,
    "New Zealand",
    "NZ",
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return {
    id: `nz-seed-${index + 1}`,
    linzId: null,
    countryCode: "NZ",
    region: item.region,
    district: item.territorialAuthority,
    area: suburbLocality,
    territorialAuthority: item.territorialAuthority,
    majorName,
    suburbLocality,
    additionalNames,
    latitude: item.latitude ?? null,
    longitude: item.longitude ?? null,
    label: `${item.region} / ${item.territorialAuthority} / ${suburbLocality}`,
    searchText,
    isActive: true,
  };
});

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
      const words = normalizedSearchText.split(/\s+/);
      let score = 0;

      if (normalizedArea === normalizedQuery) score = 100;
      else if (normalizedDistrict === normalizedQuery) score = 90;
      else if (normalizedRegion === normalizedQuery) score = 80;
      else if (normalizedArea.startsWith(normalizedQuery)) score = 70;
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
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase();
}
