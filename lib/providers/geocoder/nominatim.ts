export type GeocodeResult = {
  latitude: number | null;
  longitude: number | null;
};

export async function geocodeWithNominatim(
  address: string,
): Promise<GeocodeResult> {
  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(
        address,
      )}`,
      {
        headers: {
          "Accept-Language": "en",
        },
      },
    );

    const data = await response.json();

    if (!Array.isArray(data) || data.length === 0) {
      return {
        latitude: null,
        longitude: null,
      };
    }

    return {
      latitude: Number(data[0].lat),
      longitude: Number(data[0].lon),
    };
  } catch (error) {
    console.error("Nominatim geocode error:", error);

    return {
      latitude: null,
      longitude: null,
    };
  }
}
