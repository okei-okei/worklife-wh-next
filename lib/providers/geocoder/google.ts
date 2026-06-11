import type { GeocodeResult } from "./nominatim";

export async function geocodeWithGoogle(
  address: string,
): Promise<GeocodeResult> {
  console.warn("Google Geocoder is not implemented yet:", address);

  return {
    latitude: null,
    longitude: null,
  };
}
