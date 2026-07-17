/**
 * Dry-run first LINZ NZ Suburbs and Localities sync scaffold.
 *
 * Intended usage after installing a TS runner such as tsx:
 *   npm run locations:sync -- --dry-run
 *   npm run locations:sync
 *
 * Safety:
 * - never deletes existing nz_locations rows
 * - upserts by linz_id only
 * - records removed source candidates by setting is_active=false only when not dry-run
 * - prints counts before writing
 */

const LINZ_FEATURE_SERVICE_URL =
  "https://services.arcgis.com/xdsHIIxu2x3P8T0Z/arcgis/rest/services/NZ_Suburbs_and_Localities/FeatureServer/0";

type LinzFeature = {
  attributes: Record<string, unknown>;
  geometry?: { x?: number; y?: number };
};

function getArg(name: string) {
  return process.argv.includes(name);
}

function text(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function pickField(
  attributes: Record<string, unknown>,
  candidates: string[],
) {
  for (const candidate of candidates) {
    const value = text(attributes[candidate]);
    if (value) return value;
  }

  return "";
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`LINZ request failed: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

async function fetchMetadata() {
  return fetchJson<{ fields?: Array<{ name: string; type: string }> }>(
    `${LINZ_FEATURE_SERVICE_URL}?f=json`,
  );
}

async function fetchFeatures(offset: number) {
  const params = new URLSearchParams({
    f: "json",
    where: "1=1",
    outFields: "*",
    returnGeometry: "true",
    outSR: "4326",
    resultOffset: String(offset),
    resultRecordCount: "2000",
  });

  return fetchJson<{ features?: LinzFeature[]; exceededTransferLimit?: boolean }>(
    `${LINZ_FEATURE_SERVICE_URL}/query?${params.toString()}`,
  );
}

function mapFeature(feature: LinzFeature) {
  const attributes = feature.attributes;
  const linzId =
    pickField(attributes, ["OBJECTID", "objectid", "LINZ_ID", "id"]) ||
    crypto.randomUUID();
  const region = pickField(attributes, ["REGC2023_V1_00_NAME", "REGION", "region"]);
  const territorialAuthority = pickField(attributes, [
    "TA2023_V1_00_NAME",
    "TERRITORIAL_AUTHORITY",
    "TA_NAME",
    "district",
  ]);
  const suburbLocality = pickField(attributes, [
    "SUBURB_LOCALITY",
    "LOCALITY",
    "NAME",
    "name",
  ]);
  const majorName = pickField(attributes, ["MAJOR_NAME", "CITY", "city"]);
  const additionalNames = [
    pickField(attributes, ["ALTERNATE_NAME", "ALT_NAME"]),
  ].filter(Boolean);
  const searchText = [
    region,
    territorialAuthority,
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
    linz_id: String(linzId),
    country_code: "NZ",
    region: region || null,
    territorial_authority: territorialAuthority || null,
    major_name: majorName || null,
    suburb_locality: suburbLocality,
    additional_names: additionalNames,
    latitude: feature.geometry?.y ?? null,
    longitude: feature.geometry?.x ?? null,
    search_text: searchText,
    is_active: true,
    source: "LINZ",
    source_updated_at: new Date().toISOString(),
  };
}

async function main() {
  const dryRun = getArg("--dry-run");
  const metadata = await fetchMetadata();
  const fieldNames = metadata.fields?.map((field) => field.name) || [];
  console.log("LINZ fields:", fieldNames.join(", "));

  const mapped = [];
  for (let offset = 0; ; offset += 2000) {
    const page = await fetchFeatures(offset);
    const features = page.features || [];
    mapped.push(...features.map(mapFeature).filter((item) => item.suburb_locality));
    if (!page.exceededTransferLimit && features.length < 2000) break;
  }

  const unique = new Map(mapped.map((item) => [item.linz_id, item]));
  console.log(`Fetched ${mapped.length} rows, ${unique.size} unique locations.`);
  console.log(`Hornby candidates:`);
  for (const item of unique.values()) {
    if (item.search_text.includes("hornby")) {
      console.log(item);
    }
  }

  if (dryRun) {
    console.log("Dry-run only. No Supabase writes performed.");
    return;
  }

  throw new Error(
    "Write mode is intentionally not implemented in this scaffold. Review field mapping, then add a service-role Supabase upsert in a controlled environment.",
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
