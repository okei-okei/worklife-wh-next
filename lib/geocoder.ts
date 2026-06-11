import {
  geocodeWithNominatim,
  type GeocodeResult,
} from "./providers/geocoder/nominatim";

import { geocodeWithGoogle } from "./providers/geocoder/google";

export async function geocodeAddress(address: string): Promise<GeocodeResult> {
  const provider = process.env.NEXT_PUBLIC_GEOCODER_PROVIDER ?? "nominatim";

  switch (provider) {
    case "google":
      return geocodeWithGoogle(address);

    case "nominatim":
    default:
      return geocodeWithNominatim(address);
  }
}
